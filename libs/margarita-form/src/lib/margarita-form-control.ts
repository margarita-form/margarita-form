import { nanoid } from 'nanoid';
import {
  MF,
  MFC,
  MFF,
  MargaritaFormGroupings,
  MargaritaFormConfig,
  MargaritaFormResolver,
  MargaritaFormResolvers,
  MargaritaFormState,
  MargaritaFormValidator,
  MargaritaFormValidators,
  MargaritaFormControlContext,
  ControlLike,
  ControlValue,
  MargaritaFormResolverOutput,
} from './margarita-form-types';
import { Observable, debounceTime, distinctUntilChanged, firstValueFrom, map, shareReplay } from 'rxjs';
import { Params } from './managers/margarita-form-params-manager';
import { ConfigManager } from './managers/margarita-form-config-manager';
import { defaultValidators } from './validators/default-validators';
import { isEqual, isIncluded } from './helpers/check-value';
import { ManagerInstances, createManagers } from './managers/margarita-form-create-managers';
import { toHash } from './helpers/to-hash';
import { MargaritaFormExtensions, initializeExtensions } from './extensions/margarita-form-extensions';
import { resolveFunctionOutputPromises, createResolverContext } from './helpers/resolve-function-outputs';

export class MargaritaFormControl<FIELD extends MFF<unknown, FIELD>> implements ControlLike<FIELD> {
  public key: string;
  public uid: string = nanoid(4);
  public syncId: string = nanoid(4);
  public keyStore: Set<string>;
  private _listeningToChanges = true;
  public managers: ManagerInstances;
  private cache = new Map<string, unknown>();

  constructor(public field: FIELD, public context: MargaritaFormControlContext = {}) {
    const { initialIndex, keyStore = new Set<string>() } = context;
    this.keyStore = keyStore;
    this.key = this._generateKey(initialIndex);
    this.managers = createManagers<typeof this>(this);
  }

  private _generateKey = (index = 0): string => {
    const stringPath = this.getPath('default');
    const key = toHash([...stringPath, index]);
    const exists = this.keyStore.has(key);
    if (exists) return this._generateKey(index + 1);
    return key;
  };

  /**
   * Unsubscribe from all subscriptions for current control
   */
  public cleanup = () => {
    Object.values(this.managers).forEach((manager) => manager.cleanup());
    this._listeningToChanges = false;
    this.keyStore.delete(this.key);
  };

  /**
   * Resubscribe to all subscriptions for current control
   */
  public resubscribe = () => {
    if (this._listeningToChanges === false) {
      Object.values(this.managers).forEach((manager) => manager.resubscribe());
      this.keyStore.add(this.key);
    }
    this._listeningToChanges = true;
  };

  public updateSyncId = (syncId = nanoid(4)) => {
    this.syncId = syncId;
  };

  public updateKey = (key = nanoid(4)) => {
    if (key !== this.key) {
      if (this.keyStore.has(key)) {
        return console.warn(`Key ${key} already exists, all keys must be unique!`);
      }
      this.key = key;
      this.keyStore.add(key);
    }
  };

  // Context getters

  public get root(): typeof this | MFC {
    return this.context.root || this;
  }

  public get isRoot(): boolean {
    return this.root === this;
  }

  public get parent(): typeof this | MF | MFC {
    if (!this.context.parent) {
      console.warn('Root of controls reached!', this);
    }
    return this.context.parent || this;
  }

  public get config(): MargaritaFormConfig {
    if (!this.managers.config) return ConfigManager.generateConfig(this.field);
    if (!this.field.config) return this.isRoot ? this.managers.config.current : this.parent.config;
    return this.managers.config.current;
  }

  public get extensions(): MargaritaFormExtensions {
    const cachedExtensions = this.cache.get('extensions');
    if (cachedExtensions) return cachedExtensions as MargaritaFormExtensions;
    const extensions = initializeExtensions(this);
    this.cache.set('extensions', extensions);
    return extensions;
  }

  public get getManager() {
    return <MANAGER>(key: string): MANAGER => {
      const found = (this.managers as any)[key];
      if (!found) throw `Manager "${key}" not found!`;
      return found;
    };
  }

  public get locales(): undefined | string[] {
    if (this.isRoot) return this.field.locales;
    return this.field.locales || this.parent.locales;
  }

  public get currentLocale(): undefined | string {
    if (this.isRoot) return this.field.currentLocale;
    return this.field.currentLocale || this.parent.currentLocale;
  }

  public get i18n() {
    const { field, extensions } = this;
    const { i18n } = field;
    if (!i18n) return null;
    const { localization } = extensions;
    return localization.getLocalizedValue(i18n, this.currentLocale);
  }

  // Field and metadata getters

  public get name(): string {
    return this.field.name;
  }

  public get index(): number {
    if (this.parent?.managers?.controls) {
      return this.parent.managers.controls.getControlIndex(this.key);
    }
    return this.context.initialIndex ?? -1;
  }

  /**
   * Get the way how the child controls should be grouped
   */
  public get grouping(): MargaritaFormGroupings {
    return this.field.grouping || 'group';
  }

  /**
   * Check if control's output should be an array
   */
  public get expectArray(): boolean {
    return this.grouping === 'array';
  }

  /**
   * Check if control's output should be merged to parent
   */
  public get expectFlat(): boolean {
    return this.grouping === 'flat';
  }

  /**
   * Check if control's output should be an group / object
   */
  public get expectGroup(): boolean {
    return !this.expectArray && !this.expectFlat;
  }

  /**
   * Check if control's output should be an group / object
   */
  public get expectChildControls(): boolean {
    if (this.field.grouping) return true;
    if (this.field.fields) return true;
    return false;
  }

  public updateField = async (changes: Partial<FIELD | MFF>, resetControl = false) => {
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
    const part = !this.isRoot && this.parent.expectArray ? this.index : this.name;
    return [...parentPath, part];
  };

  // Value

  public get value(): ControlValue<FIELD> {
    return this.managers.value.current;
  }

  public set value(value: ControlValue<FIELD>) {
    this.managers.value.updateValue(value);
  }

  /**
   * Listen to value changes of the control
   */
  public get valueChanges(): Observable<ControlValue<FIELD>> {
    return this.managers.value.changes;
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
      this.value.filter((item) => !isEqual(value, item)),
      setAsDirty,
      emitEvent
    );
  };

  // States

  public get state(): ControlLike<FIELD>['state'] {
    return this.managers.state.value;
  }

  public get stateChanges(): ControlLike<FIELD>['stateChanges'] {
    return this.managers.state.changes.pipe(debounceTime(1), shareReplay(1));
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

  public enable = () => {
    this.updateStateValue('enabled', true);
  };

  public disable = () => {
    this.updateStateValue('enabled', false);
  };

  public toggleEnabled = () => {
    const current = this.getState('enabled');
    this.updateStateValue('enabled', !current);
  };

  public activate = () => {
    this.updateStateValue('active', true);
  };

  public deactivate = () => {
    this.updateStateValue('active', false);
  };

  public toggleActive = () => {
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

  public registerValidator = (name: string, validator: MargaritaFormValidator) => {
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

  public get params(): Params {
    return this.managers.params.current;
  }

  public get paramsChanges(): Observable<Params> {
    return this.managers.params.changes.pipe(debounceTime(1), shareReplay(1));
  }

  /**
   * Get resolvers for the control
   */
  public get resolvers(): MargaritaFormResolvers {
    const fieldResolvers = this.field.resolvers || {};
    const parentResolvers = this.context.parent?.field?.resolvers || {};
    return { ...parentResolvers, ...fieldResolvers };
  }

  /**
   * Register a new resolver
   * @param name string
   * @param resolver MargaritaFormResolver
   */
  public registerResolver = (name: string, resolver: MargaritaFormResolver) => {
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
  public get hasControls(): boolean {
    return this.managers.controls.hasControls;
  }

  /**
   * Check if control has any active child controls
   */
  public get hasActiveControls(): boolean {
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
      const [first, ...rest] = identifier;
      const control = this.managers.controls.getControl(first);
      if (!control) return undefined;
      if (rest.length === 0) return control;
      return control.getControl(rest);
    }
    return this.managers.controls.getControl(identifier) as any;
  };

  /**
   * Check if control exists
   * @param identifier name, index or key of the control
   * @returns boolean
   */
  public hasControl: ControlLike['hasControl'] = (identifier) => {
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
  public getOrAddControl: ControlLike<this['field']>['getOrAddControl'] = (field) => {
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
  public addControl: ControlLike['addControl'] = (field, replaceExisting) => {
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
  public removeControl = (identifier: string | number) => {
    this.managers.controls.removeControl(identifier);
  };

  /**
   * Moves a child control to a new index in the array.
   * @param identifier name, index or key of the control to move
   * @param toIndex index to move the control to
   */
  public moveControl = (identifier: string, toIndex: number) => {
    this.managers.controls.moveControl(identifier, toIndex);
  };

  /**
   * Add new controls to the form array.
   * @param field The field to use as a template for the new controls
   */
  public appendControls: ControlLike['appendControls'] = (fieldTemplates) => {
    return this.managers.controls.appendRepeatingControls(fieldTemplates);
  };

  /**
   * Add new control to the form array.
   * @param field The field to use as a template for the new controls
   */
  public appendControl: ControlLike['appendControl'] = (fieldTemplate, overrides) => {
    return this.managers.controls.appendRepeatingControl(fieldTemplate, overrides);
  };

  /**
   * Remove the control from the parent
   */
  public remove = () => {
    this.parent.removeControl(this.key);
  };

  /**
   * Move control to another index
   * @param toIndex index to move the control to
   */
  public moveToIndex = (toIndex: number) => {
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
  public setRef: ControlLike['setRef'] = (ref) => {
    return this.managers.ref.addRef(ref);
  };

  // Submit

  public get onSubmit(): Observable<this> {
    return this.getStateChanges('submits').pipe(map(() => this));
  }

  public submit = async () => {
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
            const submitResponse = await this._resolveValidSubmitHandler();
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
      const invalidSubmitHandler = this._resolveInvalidSubmitHandler();
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

  private async _resolveValidSubmitHandler(): Promise<any> {
    const { handleSubmit } = this.field;
    if (typeof handleSubmit === 'string') return await this._resolveInvalidSubmitPostHandler(handleSubmit);
    if (typeof handleSubmit === 'function') return await Promise.resolve(handleSubmit(this));
    if (handleSubmit?.valid) return await Promise.resolve(handleSubmit.valid(this));

    const action = this.managers.ref.formAction;
    if (!action) throw 'No submit handler for valid submit!';
    return await this._resolveInvalidSubmitPostHandler(action);
  }

  private async _resolveInvalidSubmitPostHandler(url: string) {
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify(this.value),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async _resolveInvalidSubmitHandler(): Promise<any> {
    const { handleSubmit } = this.field;
    const defaultHandler = () => console.log('Form is invalid!', { form: this });
    if (!handleSubmit || typeof handleSubmit === 'string' || typeof handleSubmit === 'function') return defaultHandler();
    if (handleSubmit.invalid) return await Promise.resolve(handleSubmit.invalid(this));
    return console.log('Form is invalid!', {
      form: this,
    });
  }

  // Misc

  public resetValue = () => {
    this.setValue(undefined);
  };

  public resetState = (respectField = false) => {
    this.managers.state.resetState(respectField);
  };

  public reset = () => {
    this.resetValue();
    this.resetState();
  };

  /**
   * Get the control's field's value
   * @param key The field to get
   * @param fallback The fallback value
   * @returns Field's value or fallback
   */
  public getFieldValue: ControlLike['getFieldValue'] = (key, defaultValue) => {
    if (this.field[key]) return this.field[key] as any;
    return defaultValue;
  };

  /**
   * @internal
   */
  public _resolveSubmitHandler = async (key: 'beforeSubmit' | 'afterSubmit'): Promise<void> => {
    if (this.field[key]) await resolveFunctionOutputPromises(key, createResolverContext(this), this.field[key]);
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
}
