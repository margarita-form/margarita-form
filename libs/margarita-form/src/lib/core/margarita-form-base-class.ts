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
  public syncId: string = nanoid();
  public refs: MargaritaFormBaseElement[] = [];
  private _state!: BehaviorSubject<MargaritaFormState>;

  constructor() {
    const defaultState = getDefaultState(this);
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
    currentState[key] = value;
    this._state.next(currentState);
  }

  public updateSyncId() {
    this.syncId = nanoid();
  }
}
