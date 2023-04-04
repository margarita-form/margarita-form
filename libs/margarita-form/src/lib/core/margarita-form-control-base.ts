/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  skip,
  Subscription,
} from 'rxjs';
import {
  getDefaultState,
  _createUserDefinedState,
} from './margarita-form-create-state';
import {
  MargaritaFormBaseElement,
  MargaritaFormControlsArray,
  MargaritaFormField,
  MargaritaFormRootStateKeys,
  MargaritaFormState,
  MargaritaFormCommonStateKeys,
  MargaritaFormFieldValidationsState,
  MargaritaForm,
  MargaritaFormFieldValidators,
  MargaritaFormControlParams,
  MargaritaFormFieldFunction,
  MargaritaFormStateErrors,
} from '../margarita-form-types';
import { _createValidationsState } from './margarita-form-validation';
import { nanoid } from 'nanoid';
import { MargaritaFormGroupControl } from '../..';
import { _createParams } from './margarita-form-create-params';

export class MargaritaFormBase<
  F extends MargaritaFormField = MargaritaFormField
> {
  public key: string = nanoid(4);
  public syncId: string = nanoid(4);
  public refs: MargaritaFormBaseElement<F>[] = [];
  private _state: BehaviorSubject<MargaritaFormState>;
  public _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});
  public _params = new BehaviorSubject<MargaritaFormControlParams>({});
  public _subscriptions: Subscription[] = [];

  constructor(
    public field: F,
    public _parent?: MargaritaFormGroupControl<unknown, F> | null,
    public _root?: MargaritaForm | null,
    public _validators?: MargaritaFormFieldValidators
  ) {
    const defaultState = getDefaultState(this as any);
    this._state = new BehaviorSubject<MargaritaFormState>(defaultState);
  }

  /**
   * @internal
   */
  public _init() {
    const validationsStateSubscription = this._setValidationsState();
    const userDefinedStateSubscription = this._setUserDefinedState();
    const paramsSubscription = this._setParams();

    this._subscriptions.push(
      validationsStateSubscription,
      userDefinedStateSubscription,
      paramsSubscription
    );
  }

  // Common

  public get isRoot(): boolean {
    return this.root === (this as any);
  }

  public get name(): string {
    return this.field.name;
  }

  public get parent(): MargaritaFormGroupControl<unknown, F> {
    if (!this._parent) {
      console.warn('Root of controls reached!', this);
    }
    return this._parent || (this as any);
  }

  public get root(): MargaritaForm {
    return this._root || (this as unknown as MargaritaForm);
  }

  public get index(): number {
    if (this.parent instanceof MargaritaFormGroupControl) {
      return this.parent.controlsController.getControlIndex(this.key);
    }
    return -1;
  }

  // Params

  public params(): MargaritaFormControlParams {
    return this._params.getValue();
  }

  public paramsChanges(): Observable<MargaritaFormControlParams> {
    return this._params.pipe(debounceTime(5), shareReplay(1));
  }

  // State

  public get state(): MargaritaFormState {
    return this._state.getValue();
  }

  public get stateChanges(): Observable<MargaritaFormState> {
    return this._state.pipe(debounceTime(5), shareReplay(1));
  }

  public getState(key: keyof MargaritaFormState) {
    return this.state[key];
  }

  public getStateChanges(key: keyof MargaritaFormState) {
    return this.stateChanges.pipe(
      map((state) => state[key]),
      distinctUntilChanged()
    );
  }

  public enable() {
    this.updateStateValue('enabled', true);
  }

  public disable() {
    this.updateStateValue('disabled', true);
  }

  public updateState(changes: Partial<MargaritaFormState>) {
    const currentState = this.state;
    Object.assign(currentState, changes);
    this._state.next(currentState);
    if (changes.enabled !== undefined) this._enableChildren(changes.enabled);
    if (changes.disabled !== undefined) this._enableChildren(!changes.disabled);
    if (changes.dirty === true) this._setParentDirty();
    if (changes.pristine === false) this._setParentDirty();
  }

  public updateStateValue(
    key: MargaritaFormCommonStateKeys | MargaritaFormRootStateKeys,
    value: boolean
  ) {
    const currentState = this.state;
    Object.assign(currentState, { [key]: value });
    this._state.next(currentState);
    if (key === 'enabled') this._enableChildren(value);
    if (key === 'disabled') this._enableChildren(!value);
    if (key === 'dirty' && value === true) this._setParentDirty();
    if (key === 'pristine' && value === false) this._setParentDirty();
  }

  public get validators(): MargaritaFormFieldValidators {
    return this._validators || this.root.validators;
  }

  public registerValidator(
    name: string,
    validator: MargaritaFormFieldFunction
  ) {
    if (!this._validators) this._validators = { [name]: validator };
    else this._validators[name] = validator;
  }

  public clearErrors(keys?: string[]) {
    const validationStates = this._validationsState.getValue();
    const valid = Object.entries(validationStates).every(
      ([key, { valid }]) => !keys || keys.includes(key) || valid
    );
    const errors = Object.entries(validationStates).reduce(
      (acc, [key, { error }]) => {
        if (!keys) return acc;
        if (keys.includes(key)) return acc;
        if (error) acc[key] = error;
        return acc;
      },
      {} as MargaritaFormStateErrors
    );
    const invalid = !valid;
    const changes = {
      valid,
      invalid,
      errors,
    };
    this.updateState(changes);
  }

  public resetState(respectField = true) {
    const defaultState = getDefaultState(this as any, respectField);
    this._state.next(defaultState);
  }

  public resetValue() {
    this.setValue(undefined);
  }

  public reset() {
    this.resetValue();
    this.resetState();
  }

  // Internal

  public updateSyncId() {
    this.syncId = nanoid(4);
  }

  /**
   * @internal
   */
  private _setValidationsState(): Subscription {
    return _createValidationsState(this as any).subscribe((validationState) => {
      this._validationsState.next(validationState);
    });
  }

  /**
   * @internal
   */
  private _setUserDefinedState(): Subscription {
    return _createUserDefinedState(this as any).subscribe((changes) => {
      this.updateState(changes);
    });
  }

  /**
   * @internal
   */
  private _setParams(): Subscription {
    return _createParams(this as any).subscribe((params) => {
      this._params.next(params);
    });
  }

  // Not implemented

  public setValue(value: unknown, setAsDirty = true) {
    console.warn('Trying to access "setValue" which is not available!', {
      context: this,
      value,
      setAsDirty,
    });
  }

  get valueChanges(): Observable<unknown> {
    console.warn('Trying to access "valueChanges" which is not available!', {
      context: this,
    });
    return null as unknown as Observable<unknown>;
  }

  get controls(): MargaritaFormControlsArray<unknown, any> {
    console.warn('Trying to access "controls" which is not available!', {
      context: this,
    });
    return [];
  }

  public getControl(identifier: string | number) {
    console.warn('Trying to use method "getControl" which is not available!', {
      identifier,
      context: this,
    });
    return null;
  }

  public hasControl(identifier: string | number) {
    console.warn('Trying to use method "hasControl" which is not available!', {
      identifier,
      context: this,
    });
    return false;
  }

  public getOrAddControl(field: MargaritaFormField) {
    console.warn(
      'Trying to use method "getOrAddControl" which is not available!',
      {
        field,
        context: this,
      }
    );
  }

  public addControl(field: MargaritaFormField) {
    console.warn('Trying to use method "addControl" which is not available!', {
      field,
      context: this,
    });
  }

  public removeControl(identifier: string) {
    console.warn(
      'Trying to use method "removeControl" which is not available!',
      { identifier, context: this }
    );
  }

  /**
   * @internal
   */
  public _enableChildren(value: boolean) {
    // Just a placeholder
  }

  /**
   * @internal
   */
  public _setParentDirty() {
    if (!this.isRoot) this.parent.updateStateValue('dirty', true);
  }
}
