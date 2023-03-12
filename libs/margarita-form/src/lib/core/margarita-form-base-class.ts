/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { getDefaultState } from './margarita-form-create-state';
import {
  MargaritaFormBaseElement,
  MargaritaFormState,
  MargaritaFormStaticStateKeys,
} from '../margarita-form-types';
import { addRef } from './margarita-form-add-ref';

export class MargaritaFormBase {
  public refs: MargaritaFormBaseElement[] = [];
  private _state!: BehaviorSubject<MargaritaFormState>;

  constructor() {
    const defaultState = getDefaultState(this);
    this._state = new BehaviorSubject<MargaritaFormState>(defaultState);
  }

  get setRef() {
    return (ref: unknown) => {
      return addRef(ref as MargaritaFormBaseElement, this as any);
    };
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
}
