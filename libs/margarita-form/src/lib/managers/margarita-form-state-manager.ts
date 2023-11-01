import { combineLatest, debounceTime, distinctUntilChanged, firstValueFrom, map, shareReplay, skip, switchMap, tap } from 'rxjs';
import {
  MargaritaFormState,
  MargaritaFormStateErrors,
  CommonRecord,
  MFC,
  MargaritaFormStateChildren,
  UserDefinedStates,
  MargaritaFormStateAllErrors,
  MargaritaFormValidatorResult,
} from '../margarita-form-types';
import { BaseManager } from './margarita-form-base-manager';
import { isEqual, valueExists } from '../helpers/check-value';
import { getResolverOutputMapObservable, getResolverOutputMapSyncronous } from '../helpers/resolve-function-outputs';

// States which can be modfiied in the field
export const fieldStateKeys: (keyof UserDefinedStates)[] = [
  'enabled',
  'disabled',
  'editable',
  'readOnly',
  'active',
  'inactive',
  'visible',
  'hidden',
];

export class MargaritaFormStateValue implements MargaritaFormState {
  constructor(public control: MFC) {}

  // Single states

  public errors: MargaritaFormStateErrors = {};
  public allErrors: MargaritaFormStateAllErrors = [];
  public children: MargaritaFormStateChildren = [];
  public focus = false;

  // Pair states

  // Valid & invalid
  public validating = true;
  public validated = false;
  public valid = true;
  get invalid() {
    return !this.valid;
  }
  set invalid(val: boolean) {
    this.valid = !val;
  }

  // Pristine & dirty
  public pristine = true;
  get dirty() {
    return !this.pristine;
  }
  set dirty(val: boolean) {
    this.pristine = !val;
  }

  // Untouched & touched
  public untouched = true;
  get touched() {
    return !this.untouched;
  }
  set touched(val: boolean) {
    this.untouched = !val;
  }

  // Enabled & disabled
  public enabled = true;
  get disabled() {
    return !this.enabled;
  }
  set disabled(val: boolean) {
    this.enabled = !val;
  }

  // Editable & readonly
  public editable = true;
  get readOnly() {
    return !this.editable;
  }
  set readOnly(val: boolean) {
    this.editable = !val;
  }

  // Active & inactive
  public active = true;
  get inactive() {
    return !this.active;
  }
  set inactive(val: boolean) {
    this.active = !val;
  }

  // Visible & hidden
  public visible = true;
  get hidden() {
    return !this.visible;
  }
  set hidden(val: boolean) {
    this.visible = !val;
  }

  // Computed states

  // Has value
  get hasValue() {
    return valueExists(this.control.value);
  }

  // Show error
  private _shouldShowError: boolean | undefined = undefined;
  get shouldShowError() {
    if (this._shouldShowError === undefined) {
      const interacted = this.touched || (this.dirty && !this.focus);
      return this.validated && this.invalid && interacted;
    }
    return this._shouldShowError;
  }
  set shouldShowError(value) {
    if (this._shouldShowError === undefined && value !== undefined) {
      console.warn(
        'Automatic value for "shouldShowError" disabled due to manual override! Enable automatic value by setting "shouldShowError" to "undefined"',
        this
      );
    }
    this._shouldShowError = value;
  }

  // Root states

  get parentIsActive() {
    if (this.control.isRoot) return this.active;
    return this.control.parent.state.active;
  }

  private _submitted = false;
  get submitted() {
    return this._submitted;
  }
  set submitted(value: boolean) {
    this._submitted = value;
  }

  private _submitting = false;
  get submitting() {
    return this._submitting;
  }
  set submitting(value: boolean) {
    this._submitting = value;
  }

  private _submitResult: MargaritaFormState['submitResult'] = 'not-submitted';
  get submitResult() {
    return this._submitResult;
  }
  set submitResult(value: MargaritaFormState['submitResult']) {
    this._submitResult = value;
  }

  private _submits = 0;
  get submits() {
    return this._submits;
  }
  set submits(value: number) {
    this._submits = value;
  }
}

class StateManager<CONTROL extends MFC> extends BaseManager<MargaritaFormStateValue> {
  public override value: MargaritaFormStateValue;

  constructor(public override control: CONTROL) {
    super('state', control);
    this.value = new MargaritaFormStateValue(control);
  }

  public override prepare(): void {
    this._setInitialState();
  }

  public override afterInitialize(): void {
    const userDefinedStateSubscriptionObservable = this.control.fieldChanges.pipe(
      switchMap(() => {
        const state = fieldStateKeys.reduce((acc, key) => {
          const value = this.control.field[key];
          if (valueExists(value)) acc[key] = value;
          return acc;
        }, {} as CommonRecord);
        return getResolverOutputMapObservable(state, this.control);
      })
    );

    this.createSubscription(userDefinedStateSubscriptionObservable, (state) => {
      this.updateStates(state);
    });

    const validationStateSubscriptionObservable = this.control.valueChanges.pipe(
      switchMap(() => {
        if (!this.value.validating) this.updateState('validating', true);
        const validators = this.control.validators;
        const validation = this.control.field.validation || {};
        if (this.control.config.requiredNameCase) {
          validation['controlNameCase'] = this.control.config.requiredNameCase;
        }
        return getResolverOutputMapObservable<MargaritaFormValidatorResult>(validation, this.control, validators);
      }),
      shareReplay(1)
    );

    const childStateSubscriptionObservable = this.control.managers.controls.changes.pipe(
      switchMap((controls) => {
        if (!controls.length) return Promise.resolve([]);
        const stateChanges = controls.map((control) => control.stateChanges);
        return combineLatest(stateChanges);
      }),
      distinctUntilChanged()
    );

    this.createSubscription(
      combineLatest([validationStateSubscriptionObservable, childStateSubscriptionObservable]),
      ([validationResult, childStates]) => {
        this._updateValidationState(validationResult, childStates);
      }
    );

    const activeChangesSubscriptionObservable = this.changes.pipe(
      map((state) => state.active),
      distinctUntilChanged(),
      skip(this.control.field.active ? 0 : 1)
    );

    this.createSubscription(activeChangesSubscriptionObservable, () => {
      if (!this.control.isRoot) {
        this.control.parent.managers.value.refreshSync();
      }
    });
  }

  private _emitChanges() {
    this.control.updateSyncId();
    this.emitChange(this.value);
  }

  private _updateValidationState(validationResult: Record<string, MargaritaFormValidatorResult>, childStates: MargaritaFormStateChildren) {
    const childrenAreValid = childStates.every((child) => child.valid || child.inactive);
    const currentIsValid = Object.values(validationResult).every((state) => state && state.valid);

    const valid = currentIsValid && childrenAreValid;

    const errors = Object.entries(validationResult).reduce((acc, [key, { valid, error }]) => {
      if (!valid && error) acc[key] = error;
      return acc;
    }, {} as MargaritaFormStateErrors);

    const hasErrors = Object.keys(errors).length > 0;
    const currentPathAsString = this.control.getPath().join('.');
    const initialAllErrors = hasErrors
      ? ([{ path: currentPathAsString, errors, control: this.control }] as MargaritaFormStateAllErrors)
      : [];

    const childErrors = childStates.map((child) => child.allErrors);

    const allErrors = childErrors.reduce((acc, allErrors) => {
      acc.push(...allErrors);
      return acc;
    }, initialAllErrors);

    const changes = {
      valid,
      errors,
      children: childStates,
      allErrors,
      validating: false,
      validated: true,
    };
    this.updateStates(changes);
  }

  private get _mappedFieldState() {
    const stateEntries: ([] | [string, unknown])[] = fieldStateKeys.map((key) => {
      const value = this.control.field[key];
      if (!valueExists(value)) return [];
      return [key, value];
    });
    const state = Object.fromEntries(stateEntries);
    return state;
  }

  private _setInitialState() {
    const state = getResolverOutputMapSyncronous(this._mappedFieldState, this.control);
    this.updateStates(state);
    this._setInitialValidationState();
  }

  private _setInitialValidationState() {
    const validators = this.control.validators;
    const validation = this.control.field.validation || {};
    if (this.control.config.requiredNameCase) {
      validation['controlNameCase'] = this.control.config.requiredNameCase;
    }
    const syncronousValidationResults = getResolverOutputMapSyncronous<MargaritaFormValidatorResult>(validation, this.control, validators);
    const currentChildStateResults = this.control.activeControls.map((control) => control.state);
    this._updateValidationState(syncronousValidationResults, currentChildStateResults);
  }

  // Methods

  public updateState(key: keyof MargaritaFormState, value: MargaritaFormState[typeof key], emit = true) {
    const changed = !isEqual(this.value[key], value);
    if (!changed) return false;
    Object.assign(this.value, { [key]: value });
    if (key === 'enabled') this._enableChildren(!!value);
    if (key === 'disabled') this._enableChildren(!value);
    if (key === 'dirty' && value === true) this._setParentDirty();
    if (key === 'pristine' && value === false) this._setParentDirty();
    if (emit) this._emitChanges();
    if (key === 'children') return false;
    return true;
  }

  public updateStates(changes: Partial<MargaritaFormState>, emit = true) {
    const changed = Object.entries(changes).reduce((acc, [key, value]: [any, any]) => {
      const changed = this.updateState(key, value, false);
      if (changed) return true;
      return acc;
    }, false);
    if (!changed) return false;
    if (emit) this._emitChanges();
    return true;
  }

  /**
   * Validate the control and update state. Mark the control as touched to show errors.
   * @param setAsTouched Set the touched state to true
   */
  public async validate(setAsTouched = true): Promise<boolean> {
    // Validate children
    const childValidations = this.control.controls.map((control) => control.validate());
    await Promise.all(childValidations);

    // Validate self
    const changes = this.changes.pipe(debounceTime(5));
    this.control.managers.value.refreshSync(false, false);
    await firstValueFrom(changes);

    if (setAsTouched) this.updateState('touched', true);

    return this.value.valid;
  }

  public resetState(respectField = false) {
    const changes: CommonRecord = {
      pristine: true,
      untouched: true,
    };
    if (!respectField) {
      changes['enabled'] = true;
      changes['editable'] = true;
    }
    this.updateStates(changes);
  }

  // Internal

  /**
   * @internal
   */
  private _enableChildren(value: boolean) {
    this.control.controls.forEach((control) => {
      control.updateStateValue('enabled', value);
    });
  }

  /**
   * @internal
   */
  private _setParentDirty() {
    if (!this.control.isRoot) {
      this.control.parent.updateStateValue('dirty', true);
    }
  }
}

export { StateManager };
