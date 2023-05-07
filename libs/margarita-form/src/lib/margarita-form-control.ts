import { nanoid } from 'nanoid';
import {
  MF,
  MFC,
  MFCA,
  MFF,
  MargaritaFormBaseElement,
  MargaritaFormGroupings,
  MargaritaFormConfig,
  MargaritaFormResolver,
  MargaritaFormResolvers,
  MargaritaFormState,
  MargaritaFormValidator,
  MargaritaFormValidators,
} from './margarita-form-types';
import { Observable, debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { StateManager } from './managers/margarita-form-state-manager';
import { ControlsManager } from './managers/margarita-form-controls-manager';
import { ValueManager } from './managers/margarita-form-value-manager';
import { RefManager } from './managers/margarita-form-ref-manager';
import { Params, ParamsManager } from './managers/margarita-form-params-manager';
import { FieldManager } from './managers/margarita-form-field-manager';
import { getDefaultConfig } from './managers/margarita-form-config-manager';
import { defaultValidators } from './validators/default-validators';
import { isEqual, isIncluded } from './helpers/check-value';

interface MargaritaFormControlContext {
  form?: MF;
  root?: MF | MFC;
  parent?: MF | MFC;
  keyStore?: Set<string>;
}

export class MargaritaFormControl<VALUE = unknown, FIELD extends MFF<FIELD> = MFF> {
  public key: string = nanoid(4);
  public syncId: string = nanoid(4);
  public keyStore: Set<string>;
  public fieldManager: FieldManager<typeof this>;
  public controlsManager: ControlsManager<typeof this>;
  public valueManager: ValueManager<typeof this>;
  public stateManager: StateManager<typeof this>;
  public refManager: RefManager<typeof this>;
  public paramsManager: ParamsManager<typeof this>;

  #listeningToChanges = true;
  constructor(public field: FIELD, public context: MargaritaFormControlContext = {}) {
    this.keyStore = context.keyStore || new Set<string>();
    this.fieldManager = new FieldManager(this);
    this.controlsManager = new ControlsManager(this);
    this.valueManager = new ValueManager(this);
    this.stateManager = new StateManager(this);
    this.refManager = new RefManager(this);
    this.paramsManager = new ParamsManager(this);
    this.keyStore.add(this.key);
  }
  /**
   * Unsubscribe from all subscriptions for current control
   */
  public cleanup = () => {
    this.fieldManager.cleanup();
    this.controlsManager.cleanup();
    this.valueManager.cleanup();
    this.stateManager.cleanup();
    this.refManager.cleanup();
    this.paramsManager.cleanup();
    this.#listeningToChanges = false;
    this.keyStore.delete(this.key);
  };

  /**
   * Resubscribe to all subscriptions for current control
   */
  public resubscribe = () => {
    if (this.#listeningToChanges === false) {
      this.fieldManager.resubscribe();
      this.controlsManager.resubscribe();
      this.valueManager.resubscribe();
      this.stateManager.resubscribe();
      this.refManager.resubscribe();
      this.paramsManager.resubscribe();
      this.keyStore.add(this.key);
    }
    this.#listeningToChanges = true;
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

  public get form(): MF {
    if (!this.context.form) throw "Control isn't attached to a form!";
    return this.context.form;
  }

  public get root(): MF | MFC {
    return this.context.root || this;
  }

  public get isRoot(): boolean {
    return this.root === this;
  }

  public get parent(): MF | MFC {
    if (!this.context.parent) {
      console.warn('Root of controls reached!', this);
    }
    return this.context.parent || this;
  }

  public get config(): MargaritaFormConfig {
    try {
      return this.root.config;
    } catch (error) {
      return getDefaultConfig();
    }
  }

  public get locales(): undefined | string[] {
    return this.form.locales;
  }

  public get currentLocale(): undefined | string {
    return this.field.locale || this.context.parent?.currentLocale;
  }

  // Field and metadata getters

  public get name(): string {
    return this.field.name;
  }

  public get index(): number {
    if (this.parent) {
      return this.parent.controlsManager.getControlIndex(this.key);
    }
    return -1;
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
    const arrayGroupings: MargaritaFormGroupings[] = ['array', 'repeat-group'];
    return arrayGroupings.includes(this.grouping);
  }

  /**
   * Check if control's output should be an group / object
   */
  public get expectGroup(): boolean {
    return !this.expectArray;
  }

  /**
   * Check if control's output should be an group / object
   */
  public get expectChildControls(): boolean {
    if (this.field.grouping) return true;
    if (this.field.fields) return true;
    if (this.field.template) return true;
    return false;
  }

  public updateField = async (changes: Partial<FIELD>, resetControl = false) => {
    await this.fieldManager.updateField(changes, resetControl);
  };

  // Value

  public get value(): VALUE {
    return this.valueManager.current;
  }

  public set value(value: VALUE) {
    this.valueManager.updateValue(value);
  }

  /**
   * Listen to value changes of the control
   */
  public get valueChanges(): Observable<VALUE> {
    return this.valueManager.changes;
  }

  /**
   * Set value of the control
   * @param value value to set
   * @param setAsDirty update dirty state to true
   */
  public setValue = (value: unknown, setAsDirty = true, emitEvent = true) => {
    this.valueManager.updateValue(value, setAsDirty, emitEvent);
  };

  /**
   * Set value of the control group by updating it's childrens values. Unlike setValue, this method will not delete children values if they are not present in the new value.
   * @param values value to set
   * @param setAsDirty update dirty state to true
   */
  public patchValue = (values: unknown, setAsDirty = true) => {
    this.valueManager.updateValue(values, setAsDirty, true, true);
  };

  /**
   * Add a new value to array
   * @param value Value to add to the array
   * @param mustBeUnique Should the value be unique (default = false)
   * @param setAsDirty Should the dirty state be set to true
   */
  public addValue = (value: unknown, initializeWhenUndefined = true, mustBeUnique = false, setAsDirty = true) => {
    if (initializeWhenUndefined && this.value === undefined) return this.setValue([value], false, false);
    if (!Array.isArray(this.value)) throw 'Control value must be an array to add a value!';
    if (mustBeUnique && isIncluded(value, this.value)) return console.warn('Value already exists!');
    this.valueManager.updateValue([...this.value, value], setAsDirty);
  };

  /**
   * Remove a value from array
   * @param value Value to remove from the array
   * @param setAsDirty Should the dirty state be set to true
   */
  public removeValue = (value: unknown, setAsDirty = true) => {
    if (!Array.isArray(this.value)) throw 'Control value must be an array to remove a value!';
    this.valueManager.updateValue(
      this.value.filter((item) => !isEqual(value, item)),
      setAsDirty
    );
  };

  /**
   * Toggle a value in array
   * @param value Value to add or remove from the array
   * @param mustBeUnique Should the value be unique when adding (default = true)
   * @param setAsDirty Should the dirty state be set to true
   */
  public toggleValue = (value: unknown, initializeWhenUndefined = true, mustBeUnique = true, setAsDirty = true) => {
    if (initializeWhenUndefined && this.value === undefined) return this.setValue([value], false, false);
    if (!Array.isArray(this.value)) throw 'Control value must be an array to add or remove a value!';
    if (mustBeUnique && isIncluded(value, this.value)) return this.removeValue(value, setAsDirty);
    this.valueManager.updateValue([...this.value, value], setAsDirty);
  };

  // States

  public get state(): StateManager<this> {
    return this.stateManager;
  }

  public get stateChanges(): Observable<StateManager<this>> {
    return this.state.changes.pipe(debounceTime(1), shareReplay(1));
  }

  public getState = (key: keyof StateManager<this>) => {
    return this.state[key];
  };

  public getStateChanges = (key: keyof StateManager<this>) => {
    return this.stateChanges.pipe(
      map((state) => state[key]),
      distinctUntilChanged()
    );
  };

  public get validators(): MargaritaFormValidators {
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

  public updateStateValue = (key: keyof MargaritaFormState, value: MargaritaFormState[typeof key]) => {
    this.stateManager.updateState(key, value);
  };

  public updateState = (changes: Partial<MargaritaFormState>) => {
    this.stateManager.updateStates(changes);
  };

  /**
   * Validate the control and update state. Mark the control as touched to show errors.
   * @param setAsTouched Set the touched state to true
   */
  public validate = async (setAsTouched = true) => {
    await this.stateManager.validate(setAsTouched);
  };

  public registerValidator = (name: string, validator: MargaritaFormValidator) => {
    const currentValidators = this.validators;
    const validators: MargaritaFormValidators = {
      ...currentValidators,
      [name]: validator,
    };
    this.fieldManager.updateField({
      validators,
    });
  };

  // Params

  public get params(): Params {
    return this.paramsManager.current;
  }

  public get paramsChanges(): Observable<Params> {
    return this.paramsManager.changes.pipe(debounceTime(1), shareReplay(1));
  }

  public get resolvers(): MargaritaFormResolvers {
    const fieldResolvers = this.field.resolvers || {};
    const parentResolvers = this.context.parent?.field?.resolvers || {};
    if (this.config.addDefaultValidators) {
      return { ...defaultValidators, ...parentResolvers, ...fieldResolvers };
    }
    return { ...parentResolvers, ...fieldResolvers };
  }

  public registerResolver = (name: string, resolver: MargaritaFormResolver) => {
    const currentResolvers = this.resolvers;
    const resolvers: MargaritaFormResolvers = {
      ...currentResolvers,
      [name]: resolver,
    };
    this.fieldManager.updateField({
      resolvers,
    });
  };

  // Controls

  /**
   * Check if control has any child controls
   */
  public get hasControls(): boolean {
    return this.controlsManager.array.length > 0;
  }

  /**
   * Check if control has any active child controls
   */
  public get hasActiveControls(): boolean {
    return this.controlsManager.array.length > 0;
  }

  /**
   * Get all controls as an array
   */
  public get controls(): MFCA<unknown, FIELD> {
    return this.controlsManager.array;
  }

  /**
   * Get all active controls as an array
   */
  public get activeControls(): MFCA<unknown, FIELD> {
    return this.controlsManager.array.filter((control) => control.state.active);
  }

  /**
   * Get control with identifier
   * @param identifier name, index or key of the control. Provide an array of identifiers to get nested control.
   * @returns The control that was found or added or null if control doesn't exist.
   */
  public getControl = <VALUE = unknown, FIELD extends MFF = this['field']>(
    identifier: string | number | (string | number)[]
  ): MFC<VALUE, FIELD> | null => {
    type CONTROL = MFC<VALUE, FIELD>;
    if (Array.isArray(identifier)) {
      const [first, ...rest] = identifier;
      const control = this.controlsManager.getControl(first);
      if (!control) return null;
      return control.getControl(rest);
    }
    return this.controlsManager.getControl<CONTROL>(identifier);
  };

  /**
   * Check if control exists
   * @param identifier name, index or key of the control
   * @returns boolean
   */
  public hasControl = (identifier: string | number): boolean => {
    const control = this.controlsManager.getControl(identifier);
    const exists = Boolean(control);
    return exists;
  };

  /**
   * Get control or add it if it doesn't exist.
   * NOTE: If grouping is array or repeat-group this method might not work as expected as arrays and repeat-groups allow multiple controls with the same name!
   * @param field The field to use as a template for the new control
   * @returns The control that was found or added
   */
  public getOrAddControl = <VALUE = unknown, FIELD extends MFF = this['field']>(field: FIELD): MFC<VALUE, FIELD> => {
    type CONTROL = MFC<VALUE, FIELD>;
    const control = this.controlsManager.getControl<CONTROL>(field.name);
    if (!control) return this.controlsManager.addControl<FIELD, VALUE>(field);
    return control;
  };

  /**
   * Add new control to the form group.
   * @param field The field to use as a template for the new control
   * @param replaceExisting Replace existing control with the same name when parent is not an array type
   * @returns Control that was added
   */
  public addControl = <FIELD extends MFF = this['field'], VALUE = unknown>(field: FIELD, replaceExisting?: boolean): MFC<VALUE, FIELD> => {
    const exists = this.hasControl(field.name);
    if (this.expectGroup && exists && replaceExisting === undefined) {
      console.warn(`Control with name "${field.name}" already exists and will be replaced!`);
    }
    return this.controlsManager.addControl(field);
  };

  /**
   * Removes a child control from the form group.
   * @param identifier name, index or key of the control to remove
   */
  public removeControl = (identifier: string) => {
    this.controlsManager.removeControl(identifier);
  };

  /**
   * Moves a child control to a new index in the array.
   * @param identifier name, index or key of the control to move
   * @param toIndex index to move the control to
   */
  public moveControl = (identifier: string, toIndex: number) => {
    this.controlsManager.moveControl(identifier, toIndex);
  };

  /**
   * Add new controls to the form group array. If no field is provided, the template field or fields will be used.
   * @param field The field to use as a template for the new controls
   */
  public appendRepeatingControls = <FIELD extends MFF = MFF>(field?: Partial<FIELD> | FIELD[]) => {
    if (!field) {
      const { fields, template } = this.field;
      if (fields) this.appendRepeatingControls({ fields });
      else if (template) this.controlsManager.addTemplatedControl(template);
      else console.warn('No template or fields provided for repeating controls!');
    } else {
      if (Array.isArray(field)) {
        this.appendRepeatingControls({ fields: field });
      } else this.controlsManager.addTemplatedControl(field);
    }
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
      this.parent.controlsManager.moveControl(this.key, toIndex);
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
  public setRef = (ref: MargaritaFormBaseElement<this>): void => {
    return this.refManager.addRef(ref);
  };

  // Misc

  public resetValue = () => {
    this.setValue(undefined);
  };

  public resetState = (respectField = false) => {
    this.stateManager.resetState(respectField);
  };

  public reset = () => {
    this.resetValue();
    this.resetState();
  };

  /**
   * Get the control's parent's field's parameter
   * @param key The parameter to get
   * @param checkSelf If true, will check the control's own field for the parameter
   * @param deep If true, will search for the parameter in the parent's parent and so on
   * @returns The parameter value
   */
  public getParentFieldValue = <OUTPUT = unknown>(key: keyof FIELD, fallback: OUTPUT, checkSelf = true, deep = true): OUTPUT => {
    if (checkSelf && this.field[key]) return this.field[key] as OUTPUT;
    if (!this.isRoot && this.parent && this.parent.field[key]) return this.parent.field[key];
    if (deep && !this.isRoot && this.parent) return this.parent.getParentFieldValue<OUTPUT>(key, fallback, false, deep);
    return fallback as OUTPUT;
  };

  /**
   * Get the control's parent's field's parameter
   * @param key The parameter to get
   * @param checkSelf If true, will check the control's own field for the parameter
   * @returns The parameter value
   */
  public getRootFieldValue = <OUTPUT = unknown>(key: keyof FIELD, fallback: OUTPUT, checkSelf = true): OUTPUT => {
    if (checkSelf && this.field[key]) return this.field[key] as OUTPUT;
    if (!this.isRoot && this.root && this.root.field[key]) return this.parent.field[key];
    return fallback as OUTPUT;
  };
}
