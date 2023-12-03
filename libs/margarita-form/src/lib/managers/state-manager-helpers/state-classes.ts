import { MFC, MargaritaFormState } from '../../margarita-form-types';
import { StateManager } from '../margarita-form-state-manager';

export class GeneralState<V> {
  public currentValue: V = undefined as V;
  public snapshotValue: V = undefined as V;
  constructor(public state: StateManager<MFC>, public key: keyof MargaritaFormState, public initialValue?: V) {
    this.currentValue = initialValue as V;
  }

  public setSnapshotValue(value: V) {
    this.snapshotValue = value;
    return this;
  }

  public setValue(key: keyof MargaritaFormState, value: V) {
    if (key === this.key) {
      this.currentValue = value;
      this.snapshotValue = value;
    }
  }

  toJSON() {
    return {
      [this.key]: this.currentValue,
    };
  }

  public matches(key: keyof MargaritaFormState) {
    return this.key === key;
  }
}

export class BooleanPairState {
  public currentValue = true;
  public snapshotValue = true;
  constructor(
    public state: StateManager<MFC>,
    public primaryKey: keyof MargaritaFormState,
    public secondaryKey: keyof MargaritaFormState
  ) {}

  public setSnapshotValue(value: boolean) {
    this.snapshotValue = value;
    return this;
  }

  public setValue(key: keyof MargaritaFormState, value: boolean) {
    if (key === this.primaryKey) {
      this.currentValue = value;
      this.snapshotValue = value;
    } else if (key === this.secondaryKey) {
      this.currentValue = !value;
      this.snapshotValue = !value;
    }
  }

  get secondaryValue() {
    return !this.currentValue;
  }

  set secondaryValue(value: boolean) {
    this.currentValue = !value;
  }

  toJSON() {
    return {
      [this.primaryKey]: this.currentValue,
      [this.secondaryKey]: !this.currentValue,
    };
  }

  public matches(key: keyof MargaritaFormState) {
    return this.primaryKey === key || this.secondaryKey === key;
  }
}

export class DerivedState<V> {
  private cachedValue: V = undefined as V;
  public snapshotValue: V = undefined as V;
  constructor(public state: StateManager<MFC>, public key: keyof MargaritaFormState, public callback: (state: StateManager<MFC>) => V) {}

  get currentValue() {
    const result = this.callback(this.state);
    this.cachedValue = result;
    this.snapshotValue = result;
    return result;
  }

  set currentValue(value) {
    throw new Error('Derived state cannot be set');
  }

  public setValue() {
    throw new Error('Derived state cannot be set');
  }

  toJSON(internal = false) {
    if (internal)
      return {
        [this.key]: this.cachedValue,
      };
    try {
      return {
        [this.key]: this.currentValue,
      };
    } catch (error) {
      return {
        [this.key]: this.cachedValue,
      };
    }
  }

  public matches(key: keyof MargaritaFormState) {
    return this.key === key;
  }
}

export type StateClass = GeneralState<unknown> | BooleanPairState | DerivedState<unknown>;
