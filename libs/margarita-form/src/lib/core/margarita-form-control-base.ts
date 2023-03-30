/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  debounceTime,
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
} from '../margarita-form-types';
import { _createValidationsState } from './margarita-form-validation';
import { nanoid } from 'nanoid';
import { MargaritaFormGroupControl } from '../..';

export class MargaritaFormBase<
  F extends MargaritaFormField = MargaritaFormField
> {
  public key: string = nanoid(4);
  public syncId: string = nanoid(4);
  public refs: MargaritaFormBaseElement<F>[] = [];
  public _subscriptions: Subscription[] = [];
  public _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});
  private _state: BehaviorSubject<MargaritaFormState>;

  constructor(
    public field: F,
    public _parent?: MargaritaFormGroupControl<unknown, F> | null,
    public _root?: MargaritaForm | null,
    public _validators?: MargaritaFormFieldValidators
  ) {
    const defaultState = getDefaultState(this as any);
    this._state = new BehaviorSubject<MargaritaFormState>(defaultState);
  }

  public _init() {
    const validationsStateSubscription = this._setValidationsState();
    const userDefinedStateSubscription = this._setUserDefinedState();
    const dirtyStateSubscription = this._setDirtyState();

    this._subscriptions.push(
      validationsStateSubscription,
      userDefinedStateSubscription,
      dirtyStateSubscription
    );
  }

  // State

  public get state(): MargaritaFormState {
    return this._state.getValue();
  }

  public get stateChanges(): Observable<MargaritaFormState> {
    const observable = this._state.pipe(debounceTime(5), shareReplay(1));
    return observable;
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
  }

  // Internal

  public updateSyncId() {
    this.syncId = nanoid(4);
  }

  private _setValidationsState(): Subscription {
    return _createValidationsState(this as any).subscribe((validationState) => {
      this._validationsState.next(validationState);
    });
  }

  private _setUserDefinedState(): Subscription {
    return _createUserDefinedState(this as any).subscribe((changes) => {
      this.updateState(changes);
    });
  }

  private _setDirtyState() {
    return this.valueChanges.pipe(skip(1)).subscribe(() => {
      this.updateStateValue('dirty', true);
    });
  }

  // Not implemented getters

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

  public _enableChildren(value: boolean) {
    // Just a placeholder
  }
}
