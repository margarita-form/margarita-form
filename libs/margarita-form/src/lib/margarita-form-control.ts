import { nanoid } from 'nanoid';
import {
  MFF,
  MargaritaFormResolvers,
  MargaritaFormState,
  MargaritaFormValidators,
  MargaritaFormControlContext,
  ControlLike,
  ControlValue,
  MargaritaFormResolverOutput,
  CommonRecord,
  ControlChange,
  MargaritaFormFieldContext,
} from './margarita-form-types';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, firstValueFrom, map, shareReplay } from 'rxjs';
import { ConfigManager } from './managers/margarita-form-config-manager';
import { defaultValidators } from './validators/default-validators';
import { isEqual, isIncluded } from './helpers/check-value';
import { ManagerInstances, createManagers } from './managers/margarita-form-create-managers';
import { toHash } from './helpers/to-hash';
import { MargaritaFormExtensions, initializeExtensions } from './extensions/margarita-form-extensions';
import { removeFormFromCache } from './create-margarita-form';
import { SubmitError } from './classes/submit-error';
import { getResolverOutput, getResolverOutputPromise } from './helpers/resolve-function-outputs';

export class MargaritaFormControl<FIELD extends MFF> implements ControlLike<FIELD> {
  public key: string;
  public uid: string;
  public syncId: string = nanoid(4);
  public managers: ManagerInstances;
  public initialized = false;
  public ready = false;
  public changes: BehaviorSubject<ControlChange>;
  private cache = new Map<string, unknown>();

  constructor(
    public field: FIELD,
    public context: MargaritaFormControlContext = {
      idStore: new Set<string>(),
    }
  ) {
    this.changes = new BehaviorSubject<ControlChange>({ control: this, change: undefined, name: 'initialize' });
    if (!field.name) throw 'Missing name in field: ' + (this.isRoot ? 'root' : this.getPath('default').join(' > ') + '*');
    // console.debug('Creating control:', field.name, { field });
    this.key = this._generateKey();
    this.managers = createManagers<typeof this>(this);
    if (field.onCreate) field.onCreate({ control: this });
    this.uid = this._resolveUid();
    this.initialized = true;
  }

  private _resolveUid = (forceNew = false): string => {
    if (!forceNew && this.value && typeof this.value === 'object' && '_uid' in this.value) {
      const uid = this.value._uid as string;
      if (this.uid === uid) return uid;
      if (this.context.idStore.has(uid)) return this._resolveUid(true);
      this.context.idStore.add(uid);
      return uid;
    }
    if (!forceNew && this.uid) return this.uid;
    const uid = nanoid(4);
    this.context.idStore.add(uid);
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
    Object.values(this.managers).forEach((manager) => manager.cleanup());
    this.context.idStore.delete(this.uid);
    if (this.isRoot) removeFormFromCache(this.name);
  };

  private initialize(initial = true, after = true) {
    if (initial) {
      Object.values(this.managers).forEach((manager) => manager.onInitialize());
      this.controls.forEach((control) => control.initialize(true, false));
    }
    if (after) {
      Object.values(this.managers).forEach((manager) => manager.afterInitialize());
      this.controls.forEach((control) => control.initialize(false, true));
    }
  }

  /**
   * Resubscribe to all subscriptions for current control
   */
  public reInitialize: ControlLike<FIELD>['reInitialize'] = () => {
    this.cleanup();
    this.initialize();
  };

  public emitChange: ControlLike<FIELD>['emitChange'] = (name, change) => {
    this.changes.next({ control: this, change, name });
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
    return this.context.root || this;
  }

  public get isRoot(): ControlLike<FIELD>['isRoot'] {
    return this.root === this;
  }

  public get parent(): ControlLike<FIELD>['parent'] {
    if (!this.context.parent) {
      console.warn('Root of controls reached!', this);
    }
    return this.context.parent || this;
  }

  public get config(): ControlLike<FIELD>['config'] {
    const parentConfig = this.isRoot ? {} : this.parent.config;
    if (!this.managers.config) return ConfigManager.joinConfigs(parentConfig, this.field.config);
    if (!this.field.config) return this.isRoot ? this.managers.config.value : this.parent.config;
    return this.managers.config.value;
  }

  public get extensions(): ControlLike<FIELD>['extensions'] {
    const cachedExtensions = this.cache.get('extensions');
    if (cachedExtensions) return cachedExtensions as MargaritaFormExtensions;
    const extensions = initializeExtensions(this);
    this.cache.set('extensions', extensions);
    return extensions;
  }

  public getManager: ControlLike<FIELD>['getManager'] = (key) => {
    const found = (this.managers as any)[key];
    if (!found) throw `Manager "${key}" not found!`;
    return found;
  };

  public get locales(): ControlLike<FIELD>['locales'] {
    type ReturnType = ControlLike<FIELD>['locales'];
    if (this.isRoot) return this.field.locales as ReturnType;
    return (this.field.locales || this.parent.locales) as ReturnType;
  }

  public get currentLocale(): ControlLike<FIELD>['currentLocale'] {
    type Locale = ControlLike<FIELD>['currentLocale'];
    if (this.isRoot) return this.field.currentLocale as Locale;
    return (this.field.currentLocale || this.parent.currentLocale) as Locale;
  }

  public get i18n(): ControlLike<FIELD>['i18n'] {
    const { field, extensions } = this;
    const { i18n } = field;
    if (!i18n) return undefined;
    const { localization } = extensions;
    return localization.getLocalizedValue(i18n, this.currentLocale);
  }

  public get useStorage(): ControlLike<FIELD>['useStorage'] {
    if (this.isRoot) return this.field.useStorage;
    if (this.config.storageStrategy === 'end') return this.field.useStorage || this.parent.useStorage;
    return this.field.useStorage;
  }

  // Field and metadata getters

  public get name(): ControlLike<FIELD>['name'] {
    return this.field.name;
  }

  public get index(): ControlLike<FIELD>['index'] {
    if (!this.isRoot && this.parent.managers.controls) {
      const resolvedIndex = this.parent.managers.controls.getControlIndex(this);
      if (resolvedIndex > -1) return resolvedIndex;
    }

    const { initialIndex = -1 } = this.context;
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
    return this.field.grouping || 'group';
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
    if (!this.expectChildControls) return [];
    return (this.field.fields as any) || [];
  }

  public setField: ControlLike<FIELD>['setField'] = async (changes, resetControl = false) => {
    await this.managers.field.setField(changes as any, resetControl);
  };

  public updateField: ControlLike<FIELD>['updateField'] = async (changes, resetControl = false) => {
    await this.managers.field.updateField(changes as any, resetControl);
  };

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

  public get afterChanges(): ControlLike<FIELD>['afterChanges'] {
    return this.changes.pipe(debounceTime(1), shareReplay(1));
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
  public dispatchValue: ControlLike<FIELD>['dispatchValue'] = async (value, setAsDirty, emitEvent) => {
    if (!this.field.dispatcher) return console.warn('No dispatcher defined for this control!');
    const { dispatcher } = this.field;
    const result = dispatcher({ control: this, value }) as MargaritaFormResolverOutput<ControlValue<FIELD>>;
    if (result instanceof Promise) {
      const value = await result;
      this.setValue(value, setAsDirty, emitEvent);
    } else if (result instanceof Observable) {
      const value = await firstValueFrom(result);
      this.setValue(value, setAsDirty, emitEvent);
    } else {
      this.setValue(result, setAsDirty, emitEvent);
    }
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
    const fieldValidators = this.field.validators || {};
    const parentValidators = this.context.parent?.field?.validators || {};
    if (this.config.addDefaultValidators) {
      return { ...defaultValidators, ...parentValidators, ...fieldValidators };
    }
    return { ...parentValidators, ...fieldValidators };
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
    this.managers.state.updateState(key, value);
  };

  public updateState: ControlLike<FIELD>['updateState'] = (changes) => {
    this.managers.state.updateStates(changes);
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

  // Params

  public get params(): ControlLike<FIELD>['params'] {
    return this.managers.params.value;
  }

  public get paramsChanges(): ControlLike<FIELD>['paramsChanges'] {
    return this.managers.params.changes.pipe(debounceTime(1), shareReplay(1));
  }

  /**
   * Get resolvers for the control
   */
  public get resolvers(): ControlLike<FIELD>['resolvers'] {
    const fieldResolvers = this.field.resolvers || {};
    const parentResolvers = this.context.parent?.field?.resolvers || {};
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
    const control = this.managers.controls.getControl(field.name) as any;
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
      console.warn(`Control with name "${field.name}" already exists and will be replaced!`);
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
    return this.getStateChanges('submits').pipe(map(() => this));
  }

  /**
   * Submit the form. If the form is invalid, the invalid submit handler will be called.
   * Define submit handlers in the field's handleSubmit property. You can define a different handler for valid and invalid submits but only valid submit handler is required. If handleSubmit is a function it will be used as the valid handler.
   * If handleSubmit or handleSubmit.valid is a string, it will be used as a url for a POST request.
   * @param params Params that get passed as the second argument to the submit handler
   * @returns Promise with the submit handler's response
   */
  public submit: ControlLike<FIELD>['submit'] = async (params) => {
    try {
      await this.validate();
      if (!this.field.handleSubmit && !this.managers.ref.formAction) throw 'Add "handleSubmit" option to submit form!';
      const canSubmit = this.config.allowConcurrentSubmits || !this.state.submitting;
      if (!canSubmit) throw 'Form is already submitting!';
      this.updateStateValue('submitting', true);
      if (this.config.disableFormWhileSubmitting) this.updateStateValue('disabled', true);

      // Handle valid submit
      if (this.state.valid || this.config.allowInvalidSubmit) {
        const handleValidSubmit = async () => {
          try {
            await this._handleBeforeSubmit();
            const submitResponse = await this._resolveValidSubmitHandler(params);
            if (submitResponse instanceof SubmitError) {
              this.updateState({ submitResult: 'error', disabled: false });
              return submitResponse.value;
            } else {
              this.updateStateValue('submitResult', 'success');
              switch (this.config.handleSuccesfullSubmit) {
                case 'disable':
                  this.updateStateValue('disabled', true);
                  break;
                case 'reset':
                  this.reset();
                  break;
                default:
                  this.updateStateValue('disabled', false);
                  break;
              }
              await this._handleAfterSubmit();
              return submitResponse;
            }
          } catch (error) {
            console.error('Could not handle valid submit!', { formName: this.name, error });
            this.updateState({ submitResult: 'error', disabled: false });
            return error;
          }
        };

        const submitResponse = await handleValidSubmit();
        this.updateStateValue('submitted', true);
        this.updateStateValue('submitting', false);
        const submits = this.state.submits || 0;
        this.updateStateValue('submits', submits + 1);
        return submitResponse;
      }

      // Handle invalid submit
      const invalidSubmitHandler = this._resolveInvalidSubmitHandler(params);
      return await invalidSubmitHandler.finally(() => {
        const submits = this.state.submits || 0;
        this.updateState({
          submitting: false,
          submitted: true,
          submitResult: 'form-invalid',
          disabled: false,
          submits: submits + 1,
        });
      });
    } catch (error) {
      return console.error('Could not handle form submit! Error: ', error);
    }
  };

  private async _resolveValidSubmitHandler(params: any): Promise<any> {
    const { handleSubmit } = this.field;
    if (!handleSubmit) throw 'No submit handler for valid submit!';

    if (typeof handleSubmit === 'function') return await Promise.resolve(handleSubmit(this, params));

    if (typeof handleSubmit === 'string' && /^http.+|^\/\/.+/gi.test(handleSubmit))
      return await this._resolveValidSubmitPostHandler(handleSubmit);

    if (typeof handleSubmit === 'object' && handleSubmit.valid) return await Promise.resolve(handleSubmit.valid(this, params));

    const resolver = getResolverOutput({ getter: handleSubmit, control: this, strict: true });

    if (resolver) return await getResolverOutputPromise('handleSubmit', resolver, this);

    const action = this.managers.ref.formAction;
    if (!action) throw 'No submit handler for valid submit!';
    return await this._resolveValidSubmitPostHandler(action);
  }

  private async _resolveValidSubmitPostHandler(url: string) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(this.value),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return new SubmitError('error-on-submit', response);
    return response;
  }

  private async _resolveInvalidSubmitHandler(params: any): Promise<any> {
    const { handleSubmit } = this.field;
    const defaultHandler = () => console.log('Form is invalid!', { form: this });
    if (!handleSubmit || typeof handleSubmit === 'string' || typeof handleSubmit === 'function') return defaultHandler();
    if (handleSubmit.invalid) return await Promise.resolve(handleSubmit.invalid(this, params));
    return console.log('Form is invalid!', {
      form: this,
    });
  }

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
  public _resolveSubmitHandler = async (key: 'beforeSubmit' | 'afterSubmit'): Promise<void> => {
    const resolver = getResolverOutput({ getter: this.field[key], control: this });
    if (resolver) await getResolverOutputPromise(key, resolver, this);
    const childHandlers = this.controls.map((control) => {
      if (key === 'beforeSubmit') return control._handleBeforeSubmit();
      if (key === 'afterSubmit') return control._handleAfterSubmit();
      return control._resolveSubmitHandler(key);
    });
    await Promise.all(childHandlers);
  };

  /**
   * @internal
   */
  public _handleBeforeSubmit = async () => {
    await this._resolveSubmitHandler('beforeSubmit');
  };

  /**
   * @internal
   */
  public _handleAfterSubmit = async () => {
    if (this.config.clearStorageOnSuccessfullSubmit) this.extensions.storage.clearStorage();
    await this._resolveSubmitHandler('afterSubmit');
  };

  /**
   * @internal
   */
  public _generateContext = <PARAMS = any>(params: CommonRecord = {}): MargaritaFormFieldContext<typeof this, PARAMS> => {
    const fieldContext = this.field.context || {};
    return {
      control: this,
      value: this.value,
      ...params,
      ...fieldContext,
    };
  };
}
