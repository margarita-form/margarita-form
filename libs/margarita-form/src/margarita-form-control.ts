import { nanoid } from 'nanoid';
import {
  MFF,
  MargaritaFormResolvers,
  MargaritaFormState,
  MargaritaFormValidators,
  ControlBuildParams,
  ControlLike,
  ControlValue,
  CommonRecord,
  ControlChange,
  ControlContext,
  MargaritaFormValidator,
  MFC,
  ControlChangeName,
  Managers,
  Extensions,
  ExtensionInstanceLike,
  MargaritaFormConfig,
  MargaritaFormGroupings,
  Context,
} from './typings/margarita-form-types';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, filter, map, shareReplay } from 'rxjs';
import { ConfigManager } from './managers/config-manager';
import { isEqual, isIncluded, valueExists } from './helpers/check-value';
import { toHash } from './helpers/to-hash';
import { removeFormFromCache } from './create-margarita-form';
import { ManagerLike } from './managers/base-manager';
import { ExtensionBase } from './extensions/base/extension-base';
import { StateFactoryFunction } from './managers/state-manager-helpers/state-factory';
import { coreResolver } from './helpers/core-resolver';
import { solveResolver, getResolverOutputPromise, resolve } from './helpers/resolve-function-outputs';

export class MargaritaFormControl<FIELD extends MFF<any> = MFF> implements ControlLike<FIELD> {
  public key: string;
  public uid: string;
  public syncId: string = nanoid(4);
  public managers = {} as Managers;
  public prepared = false;
  public initialized = false;
  public ready = false;
  public changes: BehaviorSubject<ControlChange>;
  public field: FIELD;

  constructor(
    public _field: FIELD,
    public _buildParams: ControlBuildParams = {
      idStore: new Set<string>(),
      extensions: {} as Extensions,
    }
  ) {
    this.field = _field;
    this.changes = new BehaviorSubject<ControlChange>({ control: this, change: undefined, name: 'initialize' });
    if (!this.field.name) throw 'Missing name in field: ' + (this.isRoot ? 'root' : this.getPath('default').join(' > ') + '*');

    this.key = this._generateKey();
    this._constructExtensions();
    this._constructManagers();
    this.uid = this._resolveUid();

    if (this.isRoot) {
      this._startPrepareLoop();
      this._startOnInitializeLoop();
      this._startAfterInitializeLoop();
      this.managers.value.refreshSync();
    }
    if (this.field.onCreate) resolve({ getter: this.field.onCreate, control: this });
  }

  public get extensions(): ControlLike<FIELD>['extensions'] {
    return this._buildParams.extensions;
  }

  private _resolveUid = (forceNew = false): string => {
    if (!forceNew && this.value && typeof this.value === 'object' && '_uid' in this.value) {
      const uid = this.value._uid as string;
      if (this.uid === uid) return uid;
      if (this._buildParams.idStore.has(uid)) return this._resolveUid(true);
      this._buildParams.idStore.add(uid);
      return uid;
    }
    if (!forceNew && this.uid) return this.uid;
    const uid = nanoid(4);
    this._buildParams.idStore.add(uid);
    return uid;
  };

  private _generateKey = (): string => {
    // console.debug('Generating key for control:', this.field.name);
    const stringPath = this.getPath();
    const key = toHash([...stringPath]);
    return key;
  };

  /**
   * Unsubscribe from all subscriptions for current control
   */
  public cleanup: ControlLike<FIELD>['cleanup'] = () => {
    Object.values(this.managers).forEach((manager: any) => manager.cleanup());
    this._buildParams.idStore.delete(this.uid);
    if (this.isRoot) removeFormFromCache(this.name);
    this.activeExtensions.forEach(({ onCleanup }) => {
      if (onCleanup) onCleanup(this);
    });
  };

  private initialize(initial = true, after = true) {
    if (initial) {
      Object.values(this.managers).forEach((manager: any) => manager.onInitialize());
      this.controls.forEach((control) => control.initialize(true, false));
    }
    if (after) {
      Object.values(this.managers).forEach((manager: any) => manager.afterInitialize());
      this.controls.forEach((control) => control.initialize(false, true));
    }
    this.activeExtensions.forEach(({ afterReady }) => {
      if (afterReady) afterReady(this);
    });
  }

  /**
   * Resubscribe to all subscriptions for current control
   */
  public reInitialize: ControlLike<FIELD>['reInitialize'] = () => {
    this.cleanup();
    this.initialize();
  };

  public emitChange: ControlLike<FIELD>['emitChange'] = (name, change, origin = this) => {
    this.changes.next({ control: this, change, name, origin });
    if (!this.isRoot) {
      const newName: ControlChangeName = this === origin ? `${this.uid}-${name}` : name;
      this.parent.emitChange(newName, change, origin);
    }
  };

  public updateSyncId: ControlLike<FIELD>['updateSyncId'] = () => {
    this.syncId = nanoid(4);
  };

  public updateUid: ControlLike<FIELD>['updateUid'] = () => {
    this.uid = this._resolveUid();
  };

  public updateKey: ControlLike<FIELD>['updateKey'] = () => {
    this.key = this._generateKey();
    this.controls.forEach((control) => control.updateKey());
  };

  // Context getters

  /**
   * In some cases type of an attribute is not known by the compiler. Use this method to get the attribute with correct type.
   * @param key The key of the attribute
   * @returns The attribute value with custom type
   */
  public get: ControlLike<FIELD>['get'] = (key) => {
    const value = (this as CommonRecord)[key];
    return value as any;
  };

  public get root(): ControlLike<FIELD>['root'] {
    return this._buildParams.root || this;
  }

  public get isRoot(): ControlLike<FIELD>['isRoot'] {
    return this.root === this;
  }

  public get parent(): ControlLike<FIELD>['parent'] {
    if (!this._buildParams.parent) {
      console.warn('Root of controls reached!');
    }
    return this._buildParams.parent || this;
  }

  public get config(): ControlLike<FIELD>['config'] {
    const globalConfig = MargaritaFormControl.config;
    const parentConfig = this.isRoot ? {} : this.parent.config;
    if (!this.managers.config) return ConfigManager.joinConfigs(globalConfig, parentConfig, this.field.config);
    if (!this.field.config) return this.isRoot ? this.managers.config.value : this.parent.config;
    return this.managers.config.value;
  }

  private _constructExtensions = () => {
    const fieldExtensions = this.field.extensions;
    const hasExistingExtensions = valueExists(this.extensions);
    if (!hasExistingExtensions || fieldExtensions) {
      const _globalExtensions = hasExistingExtensions ? [] : [...MargaritaFormControl.extensions];
      const _fieldExtensions = this.field.extensions || [];
      const _allExtensions = [..._globalExtensions, ..._fieldExtensions] as (typeof ExtensionBase)[];

      _allExtensions.reduce((acc, constructor) => {
        try {
          if (this.extensions && this.extensions[constructor.extensionName]) {
            console.warn(`Extension "${constructor.extensionName}" already exists!`);
            return acc;
          }
          acc[constructor.extensionName] = new constructor(this.root);
          return acc;
        } catch (error) {
          throw {
            message: `Error while constructing extension "${constructor.extensionName}"!`,
            error,
          };
        }
      }, this.extensions);
    }
  };

  public get activeExtensions(): ControlLike<FIELD>['activeExtensions'] {
    return Object.values<any>(this.extensions).filter(({ activeCheck }: ExtensionInstanceLike) => (activeCheck ? activeCheck(this) : true));
  }

  public getManager: ControlLike<FIELD>['getManager'] = (key) => {
    const found = (this.managers as any)[key];
    if (!found) throw `Manager "${key}" not found!`;
    return found;
  };

  // Field and metadata getters

  public get name(): ControlLike<FIELD>['name'] {
    return coreResolver(this.field.name, this);
  }

  public get index(): ControlLike<FIELD>['index'] {
    if (!this.isRoot && this.parent.managers.controls) {
      const resolvedIndex = this.parent.managers.controls.getControlIndex(this);
      if (resolvedIndex > -1) return resolvedIndex;
    }

    const { initialIndex = -1 } = this._buildParams;
    return initialIndex;
  }

  public get valueHash(): ControlLike<FIELD>['valueHash'] {
    try {
      const map = {
        key: this.key,
        value: this.value,
      };
      return toHash(map);
    } catch (error) {
      console.warn('Could not create valueHash!', { error });
      return 'value-hash-error';
    }
  }

  /**
   * Get the way how the child controls should be grouped
   */
  public get grouping(): ControlLike<FIELD>['grouping'] {
    return coreResolver<MargaritaFormGroupings>(this.field.grouping, this, false, 'group');
  }

  /**
   * Check if control's output should be an array
   */
  public get expectArray(): ControlLike<FIELD>['expectArray'] {
    return this.grouping === 'array';
  }

  /**
   * Check if control's output should be merged to parent
   */
  public get expectFlat(): ControlLike<FIELD>['expectFlat'] {
    return this.grouping === 'flat';
  }

  /**
   * Check if control's output should be an group / object
   */
  public get expectGroup(): ControlLike<FIELD>['expectGroup'] {
    return !this.expectArray && !this.expectFlat;
  }

  /**
   * Check if control's output should be an group / object
   */
  public get expectChildControls(): ControlLike<FIELD>['expectChildControls'] {
    if (this.field.grouping) return true;
    if (this.field.fields) return true;
    return false;
  }

  public get fields(): ControlLike<FIELD>['fields'] {
    return this.managers.field.getChildFields();
  }

  public setField: ControlLike<FIELD>['setField'] = async (changes, resetControl = false) => {
    await this.managers.field.setField(changes as any, resetControl);
  };

  public updateField: ControlLike<FIELD>['updateField'] = async (changes, resetControl = false) => {
    await this.managers.field.updateField(changes as any, resetControl);
  };

  public get fieldChanges(): ControlLike<FIELD>['fieldChanges'] {
    return this.managers.field.changes as Observable<FIELD>;
  }

  public getPath: ControlLike<FIELD>['getPath'] = (outcome) => {
    const parentPath = this.isRoot ? [] : this.parent.getPath(outcome);
    if (outcome === 'controls') {
      return [...parentPath, this];
    }
    if (outcome === 'uids') {
      return [...parentPath, this.uid];
    }
    if (outcome === 'keys') {
      return [...parentPath, this.key];
    }
    // Default and indexes are the same!
    const part = !this.isRoot && this.parent.expectArray ? this.index + ':' + this.name : this.name;
    return [...parentPath, part];
  };

  // Events

  public get ownChanges(): ControlLike<FIELD>['ownChanges'] {
    return this.changes.pipe(filter((change) => change.origin === this));
  }

  public get childChanges(): ControlLike<FIELD>['childChanges'] {
    return this.changes.pipe(filter((change) => change.origin !== this));
  }

  public get afterChanges(): ControlLike<FIELD>['afterChanges'] {
    return this.changes.pipe(debounceTime(this.config?.afterChangesDebounceTime || 10), shareReplay(1));
  }

  // Value

  public get value(): ControlLike<FIELD>['value'] {
    return this.managers.value.current;
  }

  public set value(value) /* Set type is automatically added */ {
    this.managers.value.updateValue(value);
  }

  /**
   * Listen to value changes of the control
   */
  public get valueChanges(): ControlLike<FIELD>['valueChanges'] {
    return this.managers.value.changes as Observable<ControlValue<FIELD>>;
  }

  /**
   * Set value of the control
   * @param value value to set
   * @param setAsDirty update dirty state to true
   */
  public setValue: ControlLike<FIELD>['setValue'] = (value, setAsDirty = true, emitEvent = true) => {
    this.managers.value.updateValue(value, setAsDirty, emitEvent);
  };

  /**
   * Set value of the control group by updating it's childrens values. Unlike setValue, this method will not delete children values if they are not present in the new value.
   * @param values value to set
   * @param setAsDirty update dirty state to true
   */
  public patchValue: ControlLike<FIELD>['patchValue'] = (values, setAsDirty = true, emitEvent = true) => {
    this.managers.value.updateValue(values, setAsDirty, emitEvent, true);
  };

  /**
   * Run value through field's dispatcher and set the result as the new value
   */
  public dispatch: ControlLike<FIELD>['dispatch'] = async (action, setAsDirty, emitEvent) => {
    if (!this.field.dispatcher) return console.warn('No dispatcher defined for this control!');
    const { dispatcher } = this.field;
    const resolver = solveResolver<number>('dispatcher', dispatcher, this, this.resolvers, { action });
    const result = await getResolverOutputPromise('dispatcher', resolver, this);
    this.setValue(result, setAsDirty, emitEvent);
  };

  /**
   * Add a new value to array
   * @param value Value to add to the array
   * @param mustBeUnique Should the value be unique (default = false)
   * @param setAsDirty Should the dirty state be set to true
   */
  public addValue: ControlLike<FIELD>['addValue'] = (value, mustBeUnique = false, setAsDirty, emitEvent) => {
    if (this.value === undefined) return this.setValue([value], setAsDirty, emitEvent);
    if (!Array.isArray(this.value)) throw 'Control value must be an array to add a value!';
    if (mustBeUnique && isIncluded(value, this.value)) return console.warn('Value already exists!');
    this.managers.value.updateValue([...this.value, value], setAsDirty);
  };

  /**
   * Toggle a value in array
   * @param value Value to add or remove from the array
   * @param mustBeUnique Should the value be unique when adding (default = true)
   * @param setAsDirty Should the dirty state be set to true
   */
  public toggleValue: ControlLike<FIELD>['toggleValue'] = (value, mustBeUnique = true, setAsDirty = true, emitEvent = true) => {
    if (this.value === undefined) return this.setValue([value], setAsDirty, emitEvent);
    if (!Array.isArray(this.value)) throw 'Control value must be an array to add or remove a value!';
    if (mustBeUnique && isIncluded(value, this.value)) return this.removeValue(value, setAsDirty, emitEvent);
    this.managers.value.updateValue([...this.value, value], setAsDirty, emitEvent);
  };

  /**
   * Remove a value from array
   * @param value Value to remove from the array
   * @param setAsDirty Should the dirty state be set to true
   */
  public removeValue: ControlLike<FIELD>['removeValue'] = (value, setAsDirty, emitEvent) => {
    if (!Array.isArray(this.value)) throw 'Control value must be an array to remove a value!';
    this.managers.value.updateValue(
      this.value.filter((item: unknown) => !isEqual(value, item)),
      setAsDirty,
      emitEvent
    );
  };

  // States

  public get state(): ControlLike<FIELD>['state'] {
    return this.managers.state.value;
  }

  public get stateChanges(): ControlLike<FIELD>['stateChanges'] {
    return this.managers.state.changes;
  }

  public getState: ControlLike<FIELD>['getState'] = (key) => {
    return this.state[key];
  };

  public getStateChanges: ControlLike<FIELD>['getStateChanges'] = (key) => {
    return this.stateChanges.pipe(
      map((state) => state[key]),
      distinctUntilChanged()
    );
  };

  public get validators(): ControlLike<FIELD>['validators'] {
    const defaultValidators = MargaritaFormControl.validators;
    const fieldValidators = this.field.validators || {};
    if (this.isRoot) return { ...defaultValidators, ...fieldValidators };
    const parentValidators = this.parent.validators;
    return { ...defaultValidators, ...parentValidators, ...fieldValidators };
  }

  public enable: ControlLike<FIELD>['enable'] = () => {
    this.updateStateValue('enabled', true);
  };

  public disable: ControlLike<FIELD>['disable'] = () => {
    this.updateStateValue('enabled', false);
  };

  public toggleEnabled: ControlLike<FIELD>['toggleEnabled'] = () => {
    const current = this.getState('enabled');
    this.updateStateValue('enabled', !current);
  };

  public activate: ControlLike<FIELD>['activate'] = () => {
    this.updateStateValue('active', true);
  };

  public deactivate: ControlLike<FIELD>['deactivate'] = () => {
    this.updateStateValue('active', false);
  };

  public toggleActive: ControlLike<FIELD>['toggleActive'] = () => {
    const current = this.getState('active');
    this.updateStateValue('active', !current);
  };

  public updateStateValue: ControlLike<FIELD>['updateStateValue'] = (key, value: MargaritaFormState[typeof key]) => {
    return this.managers.state.updateState(key, value);
  };

  public updateState: ControlLike<FIELD>['updateState'] = (changes) => {
    return this.managers.state.updateStates(changes);
  };

  /**
   * Validate the control and update state. Mark the control as touched to show errors.
   * @param setAsTouched Set the touched state to true
   */
  public validate: ControlLike<FIELD>['validate'] = async (setAsTouched = true) => {
    return await this.managers.state.validate(setAsTouched);
  };

  public registerValidator: ControlLike<FIELD>['registerValidator'] = (name, validator) => {
    const currentValidators = this.validators;
    const validators: MargaritaFormValidators = {
      ...currentValidators,
      [name]: validator,
    };
    this.managers.field.updateField({
      validators,
    });
  };

  /**
   * Get resolvers for the control
   */
  public get resolvers(): ControlLike<FIELD>['resolvers'] {
    const fieldResolvers = this.field.resolvers || {};
    if (this.isRoot) return fieldResolvers;
    const parentResolvers = this.parent.resolvers;
    return { ...parentResolvers, ...fieldResolvers };
  }

  /**
   * Register a new resolver
   * @param name string
   * @param resolver MargaritaFormResolver
   */
  public registerResolver: ControlLike<FIELD>['registerResolver'] = (name, resolver) => {
    const currentResolvers = this.resolvers;
    const resolvers: MargaritaFormResolvers = {
      ...currentResolvers,
      [name]: resolver,
    };
    this.managers.field.updateField({
      resolvers,
    });
  };

  // Controls

  /**
   * Check if control has any child controls
   */
  public get hasControls(): ControlLike<FIELD>['hasControls'] {
    return this.managers.controls.hasControls;
  }

  /**
   * Check if control has any active child controls
   */
  public get hasActiveControls(): ControlLike<FIELD>['hasActiveControls'] {
    return this.managers.controls.array.length > 0;
  }

  /**
   * Get all controls as an array
   */
  public get controls(): ControlLike<FIELD>['controls'] {
    return this.managers.controls.array;
  }

  /**
   * Get all active controls as an array
   */
  public get activeControls(): ControlLike<FIELD>['activeControls'] {
    return this.managers.controls.array.filter((control) => control.state.active);
  }

  /**
   * Get all sibling controls as an array
   * @returns Array of sibling controls
   * @throws Error if control is root
   */
  public getSiblings: ControlLike<FIELD>['getSiblings'] = () => {
    if (this.isRoot) throw 'Cannot get siblings of root control!';
    const fields = this.parent.controls.filter((control) => control !== this);
    return fields as MFC<any>[];
  };

  /**
   * Get all active sibling controls as an array
   * @returns Array of active sibling controls
   * @throws Error if control is root
   */
  public getActiveSiblings: ControlLike<FIELD>['getActiveSiblings'] = () => {
    const siblings = this.getSiblings();
    return siblings.filter((control) => control.state.active) as MFC<any>[];
  };

  /**
   * Get sibling control with identifier
   * @param identifier name, index or key of the control
   * @returns The control that was found or added or null if control doesn't exist.
   * @throws Error if control is root
   */
  public getSibling: ControlLike<FIELD>['getSibling'] = (identifier) => {
    if (this.isRoot) throw 'Cannot get sibling of root control!';
    return this.parent.getControl<any>(identifier);
  };

  /**
   * Get control with identifier
   * @param identifier name, index or key of the control. Provide an array of identifiers to get nested control.
   * @returns The control that was found or added or null if control doesn't exist.
   */
  public getControl: ControlLike<FIELD>['getControl'] = (identifier) => {
    if (Array.isArray(identifier)) {
      const [first, ...rest] = identifier as string[];
      const control = this.managers.controls.getControl(first);
      if (!control) return undefined;
      if (rest.length === 0) return control;
      return control.getControl(rest);
    }
    return this.managers.controls.getControl(identifier) as any;
  };

  /**
   * Find control with identifier. Searches all child controls recursively and returns the first match.
   * @param identifier name, index or key of the control. Provide an array of identifiers to get nested control.
   * @returns The control that was found or added or null if control doesn't exist.
   */
  public findControl: ControlLike<FIELD>['findControl'] = (identifier) => {
    const control = this.getControl<any>(identifier);
    if (control) return control;
    if (!this.expectChildControls) return undefined;
    return this.controls.find((control) => control.findControl(identifier));
  };

  /**
   * Find control where query function returns true. Can search all child controls recursively to get all matches in the tree.
   * @param query Query function that returns true if control matches
   * @param recursive Should the query be run recursively
   * @returns The control that was found or undefined if control doesn't exist.
   * */
  public queryControls: ControlLike<FIELD>['queryControls'] = (query, recursive = true) => {
    const results = this.controls.filter(query);
    if (recursive) {
      const nestedResults = this.controls.map((control) => control.queryControls(query, recursive)).flat();
      return [...results, ...nestedResults] as MFC<any>[];
    }
    return results;
  };

  /**
   * Check if control exists
   * @param identifier name, index or key of the control
   * @returns boolean
   */
  public hasControl: ControlLike<FIELD>['hasControl'] = (identifier) => {
    const control = this.managers.controls.getControl(identifier);
    const exists = Boolean(control);
    return exists;
  };

  /**
   * Get control or add it if it doesn't exist.
   * NOTE: If grouping is array this method might not work as expected as arrays allow multiple controls with the same name!
   * @param field The field to use as a template for the new control
   * @returns The control that was found or added
   */
  public getOrAddControl: ControlLike<FIELD>['getOrAddControl'] = (field) => {
    const name = coreResolver(field.name, this);
    const control = this.managers.controls.getControl(name) as any;
    if (!control) return this.managers.controls.addControl(field) as any;
    return control;
  };

  /**
   * Add new control to the form group.
   * @param field The field to use as a template for the new control
   * @param replaceExisting Replace existing control with the same name when parent is not an array type
   * @returns Control that was added
   */
  public addControl: ControlLike<FIELD>['addControl'] = (field, replaceExisting) => {
    const exists = this.hasControl(field.name);
    if (this.expectGroup && exists && replaceExisting === undefined) {
      const name = coreResolver(field.name, this);
      console.warn(`Control with name "${name}" already exists and will be replaced!`);
    }
    return this.managers.controls.addControl(field) as any;
  };

  /**
   * Removes a child control from the form group.
   * @param identifier name, index or key of the control to remove
   */
  public removeControl: ControlLike<FIELD>['removeControl'] = (identifier) => {
    this.managers.controls.removeControl(identifier as string); // Todo: fix type
  };

  /**
   * Moves a child control to a new index in the array.
   * @param identifier name, index or key of the control to move
   * @param toIndex index to move the control to
   */
  public moveControl: ControlLike<FIELD>['moveControl'] = (identifier, toIndex) => {
    this.managers.controls.moveControl(identifier as string, toIndex); // Todo: fix type
  };

  /**
   * Add new controls to the form array.
   * @param field The field to use as a template for the new controls
   */
  public appendControls: ControlLike<FIELD>['appendControls'] = (fieldTemplates) => {
    return this.managers.controls.appendRepeatingControls(fieldTemplates);
  };

  /**
   * Add new control to the form array.
   * @param field The field to use as a template for the new controls
   */
  public appendControl: ControlLike<FIELD>['appendControl'] = (fieldTemplate, overrides) => {
    return this.managers.controls.appendRepeatingControl(fieldTemplate, overrides);
  };

  /**
   * Remove the control from the parent
   */
  public remove: ControlLike<FIELD>['remove'] = () => {
    this.parent.removeControl(this.key);
  };

  /**
   * Move control to another index
   * @param toIndex index to move the control to
   */
  public moveToIndex: ControlLike<FIELD>['moveToIndex'] = (toIndex) => {
    if (this.isRoot) {
      console.warn('Could not move control, already in root!');
    } else {
      this.parent.managers.controls.moveControl(this.key, toIndex);
    }
  };

  // Common

  /**
   * Connect control to a HTML element.
   * @example React
   * ```jsx
   * <input ref={control.setRef} />
   * ```
   * @example Vanilla JS
   * ```js
   * const el = document.querySelector('#myInput');
   * control.setRef(el);
   * ```
   */
  public setRef: ControlLike<FIELD>['setRef'] = (ref) => {
    return this.managers.ref.addRef(ref);
  };

  // Submit

  public get onSubmit(): ControlLike<FIELD>['onSubmit'] {
    type EventsChange = { name: string; change: { event: string } };
    return this.ownChanges.pipe(
      filter<any>(({ name, change }: EventsChange) => name === 'events' && change.event === 'submit'),
      map(() => this)
    );
  }

  /**
   * Submit the form. If the form is invalid, the invalid submit handler will be called.
   * Define submit handlers in the field's handleSubmit property. You can define a different handler for valid and invalid submits but only valid submit handler is required. If handleSubmit is a function it will be used as the valid handler.
   * If handleSubmit or handleSubmit.valid is a string, it will be used as a url for a POST request.
   * @param params Params that get passed as the second argument to the submit handler
   * @returns Promise with the submit handler's response
   */
  public submit: ControlLike<FIELD>['submit'] = async (params) => {
    return this.managers.events.submit(params);
  };

  // Misc

  public resetValue: ControlLike<FIELD>['resetValue'] = (
    setDirtyAs: boolean | undefined = undefined,
    resetChildren = true,
    origin = true
  ) => {
    const initialValue = this.managers.value._getInitialValue(false);
    this.setValue(initialValue, false, false);
    this.managers.controls.rebuild();
    if (setDirtyAs !== undefined) this.updateStateValue('dirty', setDirtyAs);
    if (resetChildren) this.controls.forEach((control) => control.resetValue(setDirtyAs, true, false));
    if (origin) this.managers.value.refreshSync();
  };

  public clearValue: ControlLike<FIELD>['clearValue'] = (setDirtyAs: boolean | undefined = false, resetChildren = true, origin = true) => {
    this.setValue(undefined, false, false);
    if (setDirtyAs !== undefined) this.updateStateValue('dirty', setDirtyAs);
    if (resetChildren) this.controls.forEach((control) => control.resetState());
    if (origin) this.managers.value.refreshSync();
  };

  public resetState: ControlLike<FIELD>['resetState'] = (respectField = false, resetChildren = true) => {
    this.managers.state.resetState(respectField);
    if (resetChildren) this.controls.forEach((control) => control.resetState());
  };

  public reset: ControlLike<FIELD>['reset'] = (resetChildren = true, origin = true) => {
    this.resetState(false, resetChildren);
    this.resetValue(undefined, resetChildren, origin);
  };

  public clear: ControlLike<FIELD>['clear'] = (resetChildren = true) => {
    this.resetState(false, resetChildren);
    this.clearValue(undefined, resetChildren);
  };

  /**
   * Get the control's field's value
   * @param key The field to get
   * @param fallback The fallback value
   * @returns Field's value or fallback
   */
  public getFieldValue: ControlLike<FIELD>['getFieldValue'] = (key, defaultValue) => {
    if (this.field[key]) return this.field[key] as any;
    return defaultValue;
  };

  /**
   * @internal
   */
  public _getCustomContext = (): Context => {
    const fieldContext = this.field.context || {};
    if (this.isRoot) {
      const staticContext = MargaritaFormControl.context || {};
      return {
        ...staticContext,
        ...fieldContext,
      };
    }
    const parentContext = this.parent._getCustomContext();
    return {
      ...parentContext,
      ...fieldContext,
    };
  };

  /**
   * @internal
   */
  public generateContext = <PARAMS>(params?: PARAMS, overrides: CommonRecord = {}): ControlContext<typeof this, PARAMS> => {
    const controlContext = this._getCustomContext();
    const context: ControlContext<typeof this, PARAMS> = {
      control: this,
      value: this.value,
      ...controlContext,
      ...overrides,
    };
    if (params !== undefined) context['params'] = params;
    return context;
  };

  public get context(): ControlLike<FIELD>['context'] {
    return this.generateContext();
  }

  private get _managers() {
    return {
      ...MargaritaFormControl.managers,
      ...(this.field.managers || {}),
    } as Record<string, ManagerLike>;
  }

  private _constructManagers = () => {
    this.managers = Object.entries(this._managers).reduce((acc, [key, constructor]) => {
      try {
        acc[key] = new constructor(this);
        return acc;
      } catch (error) {
        throw {
          message: `Error while constructing manager "${key}" for control "${this.name}"!`,
          error,
        };
      }
    }, this.managers as any);
  };

  public _startPrepareLoop = () => {
    if (!this.prepared) {
      this.prepared = true;
      Object.values(this.managers).forEach((manager: any) => manager.prepare());
    }
    this.controls.forEach((control) => {
      control._startPrepareLoop();
    });
  };

  public _startOnInitializeLoop = () => {
    if (!this.initialized) {
      this.initialized = true;
      Object.values(this.managers).forEach((manager: any) => manager.onInitialize());
    }
    this.controls.forEach((control) => {
      control._startOnInitializeLoop();
    });
  };

  public _startAfterInitializeLoop = () => {
    if (!this.ready) {
      this.ready = true;
      Object.values(this.managers).forEach((manager: any) => manager.afterInitialize());
    }
    this.controls.forEach((control) => {
      control._startAfterInitializeLoop();
    });
  };

  // Static

  public static config: Partial<MargaritaFormConfig> = {};
  public static managers = {} as Record<string, ManagerLike>;
  public static extensions: Set<typeof ExtensionBase> = new Set();
  public static validators = {} as Record<string, MargaritaFormValidator>;
  public static context: Partial<ControlContext<any>> = {};
  public static states: Set<StateFactoryFunction> = new Set();

  public static extend = (source: Partial<MargaritaFormControl<any>> & ThisType<MargaritaFormControl<any>>): void => {
    const target = MargaritaFormControl.prototype;
    const descriptors = Object.keys(source).reduce((descriptors, key) => {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor) descriptors[key] = descriptor;
      return descriptors;
    }, {} as PropertyDescriptorMap);

    // By default, Object.assign copies enumerable Symbols, too
    Object.getOwnPropertySymbols(source).forEach((sym) => {
      const descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor && descriptor.enumerable) descriptors[sym] = descriptor;
    });
    Object.defineProperties(target, descriptors as any);
  };

  public static setGlobalConfig = (config: Partial<MargaritaFormConfig>): void => {
    MargaritaFormControl.config = config;
  };

  public static addManager = <T extends ManagerLike>(manager: T): void => {
    const { managerName } = manager;
    if (!managerName) throw 'Manager must have a name!';
    MargaritaFormControl.managers[managerName] = manager as any;
  };

  public static removeManager = (key: string): void => {
    delete MargaritaFormControl.managers[key];
  };

  public static addExtension = <T extends typeof ExtensionBase>(extension: T): void => {
    const { extensionName } = extension;
    if (!extensionName) throw 'Extension must have a name!';
    this.extensions.add(extension);
  };

  public static removeExtension = <T extends typeof ExtensionBase>(extension: T): void => {
    this.extensions.delete(extension);
  };

  public static addValidator = (key: string, validator: MargaritaFormValidator): void => {
    MargaritaFormControl.validators[key] = validator;
  };

  public static addContextValue = <T extends keyof ControlContext>(key: T, value: ControlContext[T]): void => {
    MargaritaFormControl.context[key] = value;
  };

  public static removeContextValue = <T extends keyof ControlContext>(key: T): void => {
    delete MargaritaFormControl.context[key];
  };

  public static extendContext = (context: Partial<ControlContext>): void => {
    MargaritaFormControl.context = { ...MargaritaFormControl.context, ...context };
  };

  public static addStates = (...states: StateFactoryFunction[]): void => {
    states.forEach((state) => MargaritaFormControl.states.add(state));
  };
}
