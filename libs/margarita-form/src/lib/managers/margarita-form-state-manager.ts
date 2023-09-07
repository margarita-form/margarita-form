/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  skip,
  switchMap,
} from 'rxjs';
import {
  MargaritaFormState,
  MargaritaFormStateErrors,
  CommonRecord,
  MFC,
  MargaritaFormStateChildren,
  MargaritaFormValidatorResult,
  UserDefinedStates,
} from '../margarita-form-types';
import { BaseManager } from './margarita-form-base-manager';
import { mapResolverEntries } from '../helpers/resolve-function-outputs';
import { valueExists } from '../helpers/check-value';

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
  constructor(private control: MFC) {}

  // Single states

  public errors: CommonRecord = {};
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

  private _checkRoot(name: string) {
    if (!this.control.isRoot) throw `State "${name}" is only available in root!`;
  }

  private _submitted = false;
  get submitted() {
    this._checkRoot('submitted');
    return this._submitted;
  }
  set submitted(value: boolean) {
    this._checkRoot('submitted');
    this._submitted = value;
  }

  private _submitting = false;
  get submitting() {
    this._checkRoot('submitting');
    return this._submitting;
  }
  set submitting(value: boolean) {
    this._checkRoot('submitting');
    this._submitting = value;
  }

  private _submitResult: MargaritaFormState['submitResult'] = 'not-submitted';
  get submitResult() {
    this._checkRoot('submitResult');
    return this._submitResult;
  }
  set submitResult(value: MargaritaFormState['submitResult']) {
    this._checkRoot('submitResult');
    this._submitResult = value;
  }

  private _submits = 0;
  get submits() {
    this._checkRoot('submits');
    return this._submits;
  }
  set submits(value: number) {
    this._checkRoot('submits');
    this._submits = value;
  }
}

class StateManager<CONTROL extends MFC> extends BaseManager {
  public value: MargaritaFormStateValue;
  public changes: BehaviorSubject<MargaritaFormStateValue>;

  constructor(public control: CONTROL) {
    super();

    this.value = new MargaritaFormStateValue(control);
    this.changes = new BehaviorSubject(this.value);

    fieldStateKeys.forEach((key) => {
      const value = control.field[key];
      if (typeof value === 'boolean') this.updateStates({ [key]: value });
      if (typeof value === 'function') this.updateStates({ [key]: false });
      if (value instanceof Promise) console.debug('Handling promise states is currently not implemented'); // Todo: handle promise
      if (value instanceof Observable) console.debug('Handling observable states is currently not implemented'); // Todo: handle observable
    });
  }

  public override _init(): void {
    const userDefinedStateSubscriptionObservable = this.control.valueChanges.pipe(
      switchMap((value) => {
        const state = fieldStateKeys.reduce((acc, key) => {
          const value = this.control.field[key];
          if (typeof value === 'function') acc[key] = value;
          return acc;
        }, {} as CommonRecord);

        return mapResolverEntries({
          title: 'State',
          from: state,
          context: {
            control: this.control,
            value,
            params: null,
          },
        });
      })
    );

    this.createSubscription(userDefinedStateSubscriptionObservable, (state) => {
      this.updateStates(state);
      this._emitChanges();
    });

    const validationStateSubscriptionObservable = this.control.valueChanges.pipe(
      switchMap((value) => {
        if (!this.value.validating) this.updateState('validating', true);
        const validators = this.control.validators;
        return mapResolverEntries<MargaritaFormValidatorResult>({
          title: 'State',
          from: this.control.field.validation || {},
          resolveStaticValues: false,
          resolvers: validators,
          context: {
            control: this.control,
            value,
            params: null,
          },
        });
      }),
      combineLatestWith(
        this.control.managers.controls.changes.pipe(
          switchMap((controls) => {
            if (!controls.length) return Promise.resolve([]);
            const stateChanges = controls.map((control) => control.stateChanges);
            return combineLatest(stateChanges) as Observable<MargaritaFormStateChildren>;
          })
        )
      ),
      debounceTime(1)
    );

    this.createSubscription(validationStateSubscriptionObservable, ([validationStates, children]) => {
      const childrenAreValid = children.every((child) => child.valid || child.inactive);
      const currentIsValid = Object.values(validationStates).every((state) => state.valid);

      const valid = currentIsValid && childrenAreValid;

      const errors = Object.entries(validationStates).reduce((acc, [key, { error }]) => {
        if (error) acc[key] = error;
        return acc;
      }, {} as MargaritaFormStateErrors);

      const changes = {
        valid,
        errors,
        children,
        validating: false,
        validated: true,
      };
      this.updateStates(changes);
    });

    const activeChangesSubscriptionObservable = this.changes.pipe(
      map((state) => state.active),
      distinctUntilChanged(),
      skip(1)
    );

    this.createSubscription(activeChangesSubscriptionObservable, () => {
      if (!this.control.isRoot) {
        this.control.parent.managers.value._syncValue(false, true, false);
      }
    });
  }

  private _emitChanges() {
    this.changes.next(this.value);
    this.control.updateSyncId();
  }

  // Methods

  public updateState(key: keyof MargaritaFormState, value: MargaritaFormState[typeof key], emit = true) {
    Object.assign(this.value, { [key]: value });
    if (key === 'enabled') this._enableChildren(!!value);
    if (key === 'disabled') this._enableChildren(!value);
    if (key === 'dirty' && value === true) this._setParentDirty();
    if (key === 'pristine' && value === false) this._setParentDirty();

    if (emit) this._emitChanges();
  }

  public updateStates(changes: Partial<MargaritaFormState>, emit = true) {
    Object.entries(changes).forEach(([key, value]: [any, any]) => {
      this.updateState(key, value, false);
    });

    if (emit) this._emitChanges();
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
    this.control.setValue(this.control.value, false, true);
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
