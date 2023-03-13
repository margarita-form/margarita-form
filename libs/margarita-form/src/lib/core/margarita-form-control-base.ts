/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { getDefaultState } from './margarita-form-create-state';
import {
  MargaritaFormBaseElement,
  MargaritaFormState,
  MargaritaFormStaticStateKeys,
} from '../margarita-form-types';
import { nanoid } from 'nanoid';

export class MargaritaFormBase {
  public key: string = nanoid(4);
  public syncId: string = nanoid(4);
  public refs: MargaritaFormBaseElement[] = [];
  private _state!: BehaviorSubject<MargaritaFormState>;

  constructor() {
    const defaultState = getDefaultState(this as any);
    this._state = new BehaviorSubject<MargaritaFormState>(defaultState);
  }

  public get state(): MargaritaFormState {
    return this._state.getValue();
  }

  public get stateChanges(): Observable<MargaritaFormState> {
    const observable = this._state.pipe(shareReplay(1));
    return observable;
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

  public enable() {
    this.updateStateValue('enabled', true);
  }

  public disable() {
    this.updateStateValue('disabled', true);
  }

  public updateSyncId() {
    this.syncId = nanoid(4);
  }

  // State getters
}
