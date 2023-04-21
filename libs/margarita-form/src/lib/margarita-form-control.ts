import { nanoid } from 'nanoid';
import {
  MF,
  MFC,
  MFCA,
  MFF,
  MargaritaFormBaseElement,
  MargaritaFormFieldFunction,
  MargaritaFormFieldValidators,
  MargaritaFormGroupings,
  MargaritaFormOptions,
  MargaritaFormState,
  arrayGroupings,
} from './margarita-form-types';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs';
import { StateManager } from './managers/margarita-form-state-manager';
import { ControlsManager } from './managers/margarita-form-controls-manager';
import { ValueManager } from './managers/margarita-form-value-manager';
import { RefManager } from './managers/margarita-form-ref-manager';
import {
  Params,
  ParamsManager,
} from './managers/margarita-form-params-manager';
import { FieldManager } from './managers/margarita-form-field-manager';
import { getDefaultOptions } from './managers/margarita-form-options-manager';
import { defaultValidators } from './validators/default-validators';

interface MargaritaFormControlContext {
  form?: MF;
  root?: MF | MFC;
  parent?: MF | MFC;
}

export class MargaritaFormControl<VALUE = unknown, FIELD extends MFF = MFF> {
  public key: string = nanoid(4);
  public syncId: string = nanoid(4);

  public fieldManager: FieldManager<typeof this>;
  public controlsManager: ControlsManager<typeof this>;
  public valueManager: ValueManager<typeof this>;
  public stateManager: StateManager<typeof this>;
  public refManager: RefManager<typeof this>;
  public paramsManager: ParamsManager<typeof this>;
  constructor(
    public field: FIELD,
    public context: MargaritaFormControlContext = {}
  ) {
    this.fieldManager = new FieldManager(this);
    this.controlsManager = new ControlsManager(this);
    this.valueManager = new ValueManager(this);
    this.stateManager = new StateManager(this);
    this.refManager = new RefManager(this);
    this.paramsManager = new ParamsManager(this);
  }

  /**
   * Unsubscribe from all subscriptions for current control
   */
  public cleanup() {
    this.controlsManager.cleanup();
    this.valueManager.cleanup();
    this.stateManager.cleanup();
    this.paramsManager.cleanup();
  }

  public updateSyncId() {
    this.syncId = nanoid(4);
  }

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

  public get options(): MargaritaFormOptions {
    try {
      return this.root.options;
    } catch (error) {
      return getDefaultOptions();
    }
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
    return arrayGroupings.includes(this.grouping);
  }

  public updateField(changes: Partial<FIELD>) {
    this.fieldManager.updateField(changes);
  }

  // Value

  public get value(): VALUE {
    return this.valueManager.current;
  }

  /**
   * Listen to value changes of the control
   */
  public get valueChanges(): Observable<VALUE> {
    return this.valueManager.changes.pipe(debounceTime(1), shareReplay(1));
  }

  /**
   * Set value of the control
   * @param value value to set
   * @param setAsDirty update dirty state to true
   */
  public setValue(value: unknown, setAsDirty = true, emitEvent = true) {
    this.valueManager.updateValue(value, setAsDirty, emitEvent);
  }

  /**
   * Set value of the control group by updating it's childrens values. Unlike setValue, this method will not delete children values if they are not present in the new value.
   * @param values value to set
   * @param setAsDirty update dirty state to true
   */
  public patchValue(values: unknown, setAsDirty = true) {
    this.valueManager.updateValue(values, setAsDirty, true, true);
  }

  // States

  public get state(): StateManager<this> {
    return this.stateManager;
  }

  public get stateChanges(): Observable<StateManager<this>> {
    return this.state.changes.pipe(debounceTime(1), shareReplay(1));
  }

  public getState(key: keyof StateManager<this>) {
    return this.state[key];
  }

  public getStateChanges(key: keyof StateManager<this>) {
    return this.stateChanges.pipe(
      map((state) => state[key]),
      distinctUntilChanged()
    );
  }

  public get validators(): MargaritaFormFieldValidators {
    const fieldValidators = this.field.validators || {};
    if (this.options.addDefaultValidators) {
      return new Proxy(defaultValidators, fieldValidators);
    }
    return fieldValidators;
  }

  public enable() {
    this.updateStateValue('enabled', true);
  }

  public disable() {
    this.updateStateValue('disabled', true);
  }

  public updateStateValue(
    key: keyof MargaritaFormState,
    value: MargaritaFormState[typeof key]
  ) {
    this.stateManager.updateState(key, value);
  }

  public updateState(changes: Partial<MargaritaFormState>) {
    this.stateManager.updateStates(changes);
  }

  /**
   * Validate the control and update state. Mark the control as touched to show errors.
   * @param setAsTouched Set the touched state to true
   */
  public async validate(setAsTouched = true) {
    this.stateManager.validate(setAsTouched);
  }

  public registerValidator(
    name: string,
    validator: MargaritaFormFieldFunction
  ) {
    const currentValidators = this.validators;
    const validators: MargaritaFormFieldValidators = {
      ...currentValidators,
      [name]: validator,
    };
    this.fieldManager.updateField({
      validators,
    });
  }

  // Params

  public get params(): Params {
    return this.paramsManager.current;
  }

  public get paramsChanges(): Observable<Params> {
    return this.paramsManager.changes.pipe(debounceTime(1), shareReplay(1));
  }

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
  public get controls(): MFCA {
    return this.controlsManager.array;
  }

  /**
   * Get all active controls as an array
   */
  public get activeControls(): MFCA {
    return this.controlsManager.array.filter((control) => control.state.active);
  }

  /**
   * Get control with identifier
   * @param identifier name, index or key of the control. Provide an array of identifiers to get nested control.
   * @returns The control that was found or added or null if control doesn't exist.
   */
  public getControl<CONTROL extends MFC = MFC>(
    identifier: string | number | (string | number)[]
  ): CONTROL | null {
    if (Array.isArray(identifier)) {
      const [first, ...rest] = identifier;
      const control = this.controlsManager.getControl(first);
      if (!control) return null;
      return control.getControl(rest);
    }
    return this.controlsManager.getControl<CONTROL>(identifier);
  }

  /**
   * Check if control exists
   * @param identifier name, index or key of the control
   * @returns boolean
   */
  public hasControl(identifier: string | number): boolean {
    const control = this.controlsManager.getControl(identifier);
    const exists = Boolean(control);
    return exists;
  }

  /**
   * Get control or add it if it doesn't exist.
   * NOTE: If grouping is array or repeat-group this method might not work as expected as arrays and repeat-groups allow multiple controls with the same name!
   * @param field The field to use as a template for the new control
   * @returns The control that was found or added
   */
  public getOrAddControl<CONTROL extends MFC = MFC>(
    field: CONTROL['field']
  ): CONTROL {
    const control = this.controlsManager.getControl<CONTROL>(field.name);
    if (!control) return this.controlsManager.addControl(field) as CONTROL;
    return control;
  }

  /**
   * Add new control to the form group.
   * @param field The field to use as a template for the new control
   * @returns Control that was added
   */
  public addControl<CONTROL extends MFC = MFC>(
    field: CONTROL['field']
  ): CONTROL {
    return this.controlsManager.addControl(field) as CONTROL;
  }

  /**
   * Removes a child control from the form group.
   * @param identifier name, index or key of the control to remove
   */
  public removeControl(identifier: string) {
    this.controlsManager.removeControl(identifier);
  }

  /**
   * Moves a child control to a new index in the array.
   * @param identifier name, index or key of the control to move
   * @param toIndex index to move the control to
   */
  public moveControl(identifier: string, toIndex: number) {
    this.controlsManager.moveControl(identifier, toIndex);
  }

  /**
   * Add new controls to the form group array. If no field is provided, the template field or fields will be used.
   * @param field The field to use as a template for the new controls
   */
  public appendRepeatingControls<FIELD extends MFF = MFF>(
    field?: Partial<FIELD> | FIELD[]
  ) {
    if (!field) {
      const { fields, template } = this.field;
      if (fields) this.appendRepeatingControls({ fields });
      else if (template) this.controlsManager.addTemplatedControl(template);
      else
        console.warn('No template or fields provided for repeating controls!');
    } else {
      if (Array.isArray(field)) {
        this.appendRepeatingControls({ fields: field });
      } else this.controlsManager.addTemplatedControl(field);
    }
  }

  /**
   * Remove the control from the parent
   */
  public remove() {
    this.parent.removeControl(this.key);
  }

  /**
   * Move control to another index
   * @param toIndex index to move the control to
   */
  public moveToIndex(toIndex: number) {
    if (this.isRoot) {
      console.warn('Could not move control, already in root!');
    } else {
      this.parent.controlsManager.moveControl(this.key, toIndex);
    }
  }

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
  get setRef() {
    return (ref: MargaritaFormBaseElement<this>): void => {
      return this.refManager.addRef(ref);
    };
  }

  // Misc

  public resetValue() {
    this.setValue(undefined);
  }

  public resetState(respectField = false) {
    this.stateManager.resetState(respectField);
  }

  public reset() {
    this.resetValue();
    this.resetState();
  }
}
