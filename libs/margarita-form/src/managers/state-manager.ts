/* eslint-disable @typescript-eslint/no-unused-vars */
import { combineLatest, distinctUntilChanged, map, shareReplay, skip, switchMap, tap } from 'rxjs';
import {
  MargaritaFormState,
  MargaritaFormStateErrors,
  CommonRecord,
  MFC,
  MargaritaFormStateChildren,
  UserDefinedStates,
  MargaritaFormStateAllErrors,
  MargaritaFormValidatorResult,
  MFF,
  FieldParams,
} from '../typings/margarita-form-types';
import { BaseManager, ManagerName } from './base-manager';
import { isEqual, valueExists } from '../helpers/check-value';
import {
  getResolverOutputMapObservable,
  getResolverOutputMapPromise,
  getResolverOutputMapSyncronous,
} from '../helpers/resolve-function-outputs';
import { createStates } from './state-manager-helpers/state-value';
import { StateClass } from './state-manager-helpers/state-classes';
import { StateFactoryFunction } from './state-manager-helpers/state-factory';
import { MargaritaFormControl } from '../margarita-form-control';

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    state: StateManager<MFC>;
  }
}

declare module '../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF<any>> {
    _getStateFactories(global?: boolean): StateFactoryFunction[];
  }
}

declare module '../typings/margarita-form-types' {
  export interface MargaritaFormField<FP extends FieldParams = FieldParams> {
    customStates?: StateFactoryFunction[];
  }
}

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

class StateManager<CONTROL extends MFC> extends BaseManager<MargaritaFormState> {
  public static override managerName: ManagerName = 'state';
  private states: StateClass[] = [];

  constructor(public override control: CONTROL) {
    super(control, undefined);

    MargaritaFormControl.extend({
      _getStateFactories(global = true): StateFactoryFunction[] {
        const fieldStates = this.field.customStates || [];
        const parentStates = this.isRoot ? [] : this.parent._getStateFactories(false);
        if (!global) return [...parentStates, ...fieldStates];
        const globalStates = [...MargaritaFormControl.states];
        return [...globalStates, ...parentStates, ...fieldStates];
      },
    });

    createStates(this);
  }

  override get value(): any {
    return this.states.reduce((acc, state) => {
      const stateJson = state.toJSON();
      Object.keys(stateJson).forEach((key) => {
        Object.defineProperty(acc, key, {
          get() {
            const _cur = state.toJSON();
            return _cur[key];
          },
        });
      });
      return acc;
    }, {} as MargaritaFormState);
  }

  override set value(value) {
    if (value) {
      console.log('Setting value on state manager is not allowed', value);
    }
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
      tap(() => this.updateState('valueChanged', true)),
      switchMap(() => {
        if (!this.value.validating) this.updateState('validating', true);
        const validators = this.control.validators;
        const validation = this.control.field.validation || {};
        if (this.control.config.requiredNameCase) {
          validation['controlNameCase'] = this.control.config.requiredNameCase;
        }
        return getResolverOutputMapObservable<MargaritaFormValidatorResult>(
          validation,
          this.control,
          validators,
          {},
          this._invalidValidationWarning()
        );
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
    return this.emitChange(this.value);
  }

  private _updateValidationState(validationResult: Record<string, MargaritaFormValidatorResult>, childStates: MargaritaFormStateChildren) {
    const childrenAreValid = childStates.every((child) => child.valid || child.inactive);
    const currentIsValid = Object.values(validationResult).every((state) => state && state.valid);
    const valid = currentIsValid && childrenAreValid;
    const errors = Object.entries(validationResult).reduce((acc, [key, result]) => {
      if (!result) return acc;
      const { valid, error } = result;
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
    const mapped = this._mappedFieldState;
    const state = getResolverOutputMapSyncronous(mapped, this.control);
    Object.keys(mapped).reduce((acc, key) => {
      if (acc[key] === undefined) {
        const state = this.findState(key as keyof MargaritaFormState);
        if (state) acc[key] = state.snapshotValue;
      }
      return acc;
    }, state);
    this.updateStates(state);
    this._setInitialValidationState();
  }

  private _invalidValidationWarning =
    (returns: unknown = undefined) =>
    (validation: unknown, validators: unknown) => {
      console.warn(
        `Could not resolve validation for getter! Check if you have a typo in your validation or if you have not defined a custom validator.`,
        {
          validation,
          validators,
        }
      );
      return returns;
    };

  private _setInitialValidationState() {
    const validators = this.control.validators;
    const validation = this.control.field.validation || {};
    if (this.control.config.requiredNameCase) {
      validation['controlNameCase'] = this.control.config.requiredNameCase;
    }
    const syncronousValidationResults = getResolverOutputMapSyncronous<MargaritaFormValidatorResult>(
      validation,
      this.control,
      validators,
      {},
      this._invalidValidationWarning({ valid: false })
    );
    const currentChildStateResults = this.control.activeControls.map((control) => control.state);
    this._updateValidationState(syncronousValidationResults, currentChildStateResults);
  }

  // Methods

  private _updateStateValue(key: keyof MargaritaFormState, value: MargaritaFormState[typeof key]) {
    const changed = !isEqual(this.value[key], value);
    if (!changed) return false;
    const state = this.findState(key);
    if (!state) return false;
    state.setValue(key, value as any);
    if (key === 'enabled') this._enableChildren(!!value);
    if (key === 'disabled') this._enableChildren(!value);
    if (key === 'dirty' && value === true) this._setParentDirty();
    if (key === 'pristine' && value === false) this._setParentDirty();
    if (key === 'children') return false;
    return true;
  }

  public async updateState(key: keyof MargaritaFormState, value: MargaritaFormState[typeof key], emit = true) {
    const changed = this._updateStateValue(key, value);
    if (emit) await this._emitChanges();
    return changed;
  }

  public async updateStates(changes: Partial<MargaritaFormState>, emit = true) {
    const changed = Object.entries(changes).reduce((acc, [key, value]: [any, any]) => {
      const changed = this._updateStateValue(key, value);
      if (changed) return true;
      return acc;
    }, false);
    if (!changed) return false;
    if (emit) await this._emitChanges();
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
    const validators = this.control.validators;
    const validation = this.control.field.validation || {};
    if (this.control.config.requiredNameCase) {
      validation['controlNameCase'] = this.control.config.requiredNameCase;
    }
    const validationResult = await getResolverOutputMapPromise<MargaritaFormValidatorResult>(
      validation,
      this.control,
      validators,
      {},
      this._invalidValidationWarning()
    );
    const currentChildStateResults = this.control.activeControls.map((control) => control.state);
    this._updateValidationState(validationResult, currentChildStateResults);

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

  /**
   * @internal
   */
  registerState(state: StateClass) {
    this.states.push(state);
  }

  /**
   * @internal
   */
  registerStates(states: StateClass[]) {
    this.states.push(...states);
  }

  /**
   * @internal
   */
  findState(key: keyof MargaritaFormState) {
    return this.states.find((state) => state.matches(key));
  }

  toJSON(internal = false): MargaritaFormState {
    return this.states.reduce((acc, state) => {
      acc = { ...acc, ...state.toJSON(internal) };
      return acc;
    }, {} as MargaritaFormState);
  }
}

export { StateManager };
