/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { getDefaultState } from './margarita-form-create-state';
import {
  MargaritaFormBaseElement,
  MargaritaFormControlsArray,
  MargaritaFormField,
  MargaritaFormState,
  MargaritaFormStaticStateKeys,
} from '../margarita-form-types';
import { nanoid } from 'nanoid';

export class MargaritaFormBase<
  F extends MargaritaFormField = MargaritaFormField
> {
  public key: string = nanoid(4);
  public syncId: string = nanoid(4);
  public refs: MargaritaFormBaseElement<F>[] = [];
  private _state!: BehaviorSubject<MargaritaFormState>;

  constructor() {
    const defaultState = getDefaultState(this as any);
    this._state = new BehaviorSubject<MargaritaFormState>(defaultState);
  }

  // State

  public get state(): MargaritaFormState {
    return this._state.getValue();
  }

  public get stateChanges(): Observable<MargaritaFormState> {
    const observable = this._state.pipe(shareReplay(1));
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
  }

  public updateStateValue(key: MargaritaFormStaticStateKeys, value: boolean) {
    const currentState = this.state;
    Object.assign(currentState, { [key]: value });
    this._state.next(currentState);
  }

  // Internal

  public updateSyncId() {
    this.syncId = nanoid(4);
  }

  // Not implemented getters

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
}
