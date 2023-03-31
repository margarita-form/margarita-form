import {
  arrayGroupings,
  MargaritaFormGroupings,
  MargaritaFormBaseElement,
  MargaritaFormControl,
  MargaritaFormField,
  MargaritaFormFieldValidators,
  MargaritaFormStateErrors,
  MargaritaFormState,
  MargaritaForm,
  MargaritaFormControlsArray,
} from './margarita-form-types';
import {
  debounceTime,
  distinctUntilKeyChanged,
  Observable,
  Subscription,
} from 'rxjs';
import { shareReplay, switchMap, map, combineLatest } from 'rxjs';
import _get from 'lodash.get';
import { ControlsController } from './core/margarita-form-create-controls';
import { MargaritaFormBase } from './core/margarita-form-control-base';
import { setRef } from './core/margarita-form-control-set-ref';
import { valueExists } from './helpers/chack-value';

export class MargaritaFormGroupControl<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> extends MargaritaFormBase<F> {
  public controlsController: ControlsController<F>;

  constructor(
    public override field: F,
    public override _parent?: MargaritaFormGroupControl<unknown, F> | null,
    public override _root?: MargaritaForm | null,
    public override _validators?: MargaritaFormFieldValidators
  ) {
    super(field, _parent, _root, _validators);
    this.controlsController = new ControlsController(this);
    if (field.initialValue) this.setValue(field.initialValue, false);
    const stateSubscription = this._setState();
    this._subscriptions.push(stateSubscription);
    this._init();
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.controlsController.controlsArray.forEach((control) => {
      control.cleanup();
    });

    this.refs.forEach((ref) => {
      if (!ref || !ref.controls) return;
      const { controls = [] } = ref;
      const index = controls.findIndex((control) => control.key === this.key);
      if (index > -1) ref.controls.splice(index, 1);
    });
  }

  public get grouping(): MargaritaFormGroupings {
    return this.field.grouping || 'group';
  }

  public get expectArray(): boolean {
    return arrayGroupings.includes(this.grouping);
  }

  // Controls

  public override get controls(): MargaritaFormControlsArray<unknown, F> {
    return this.controlsController.controlsArray;
  }

  public override getControl<T = MargaritaFormControl<unknown, F>>(
    identifier: string | number
  ): T {
    return this.controlsController.getControl(identifier) as T;
  }

  public override hasControl(identifier: string | number): boolean {
    const control = this.controlsController.getControl(identifier);
    const exists = Boolean(control);
    return exists;
  }

  public override getOrAddControl<T = MargaritaFormControl<unknown, F>>(
    field: F
  ): T {
    const control = this.controlsController.getControl(field.name);
    if (!control) return this.controlsController.addControl(field) as T;
    return control as T;
  }

  public override addControl<T = MargaritaFormControl<unknown, F>>(
    field: F
  ): T {
    return this.controlsController.addControl(field) as T;
  }

  public override removeControl(identifier: string) {
    this.controlsController.removeControl(identifier);
  }

  public moveControl(identifier: string, toIndex: number) {
    this.controlsController.moveControl(identifier, toIndex);
  }

  public appendRepeatingControls(field?: Partial<F> | MargaritaFormField[]) {
    if (!field) {
      const { fields, template } = this.field;
      if (fields) this.appendRepeatingControls({ fields } as F);
      else if (template) this.controlsController.addTemplatedControl(template);
    } else {
      if (Array.isArray(field)) {
        this.appendRepeatingControls({ fields: field } as F);
      } else this.controlsController.addTemplatedControl(field);
    }
  }

  public remove() {
    this.parent.removeControl(this.key);
  }

  // Value

  public get value(): T {
    const { controlsArray } = this.controlsController;
    const activeControls = controlsArray.filter(
      (control) => control.state.active
    );
    if (this.expectArray) {
      return activeControls.map((control) => control.value) as T;
    }
    const entries = activeControls.map((control) => {
      return [control.name, control.value];
    });
    return Object.fromEntries(entries);
  }

  public override get valueChanges(): Observable<T> {
    return this.controlsController.controlChanges.pipe(
      switchMap((controls) => {
        if (!controls.length) return Promise.resolve(null as T);

        const valueChangesEntries = controls.map((control) => {
          return control.stateChanges.pipe(
            distinctUntilKeyChanged('active'),
            switchMap(({ active }) => {
              if (!active) {
                return Promise.resolve({ control, value: undefined });
              }
              return control.valueChanges.pipe(
                map((value) => {
                  return { control, value };
                })
              );
            })
          );
        });

        const valueChanges = combineLatest(valueChangesEntries).pipe(
          map((changeEntries) => {
            if (this.expectArray) {
              return changeEntries.map((entry) => entry.value);
            }

            const entries = changeEntries.map(({ control, value }) => {
              return [control.name, value];
            });
            return Object.fromEntries(entries);
          }),
          shareReplay(1)
        );

        return valueChanges as Observable<T>;
      })
    );
  }

  public override setValue(values: unknown, setAsDirty = true) {
    this._updateGroupValue(values, setAsDirty, false);
  }

  public patchValue(values: unknown, setAsDirty = true) {
    this._updateGroupValue(values, setAsDirty, true);
  }

  private _updateGroupValue(values: unknown, setAsDirty = true, patch = false) {
    try {
      if (setAsDirty) this.updateStateValue('dirty', true);
      const { controlsArray, controlsGroup } = this.controlsController;
      const isArray = Array.isArray(values);
      if (this.expectArray && isArray) {
        controlsArray.forEach((control, index) => {
          const hasValue = control && values[index];
          if (!hasValue && !patch) control.remove();
        });

        values.forEach((value, index) => {
          const control = this.controlsController.getControl(index);
          if (control) return control.setValue(value, setAsDirty);
          if (this.grouping === 'repeat-group') {
            return this.controlsController.addTemplatedControl({
              fields: this.field.fields,
              initialValue: value,
            });
          }
          console.error('Could not set values!', {
            control: this,
            values,
            error: 'Trying to add values to non repeating array!',
          });
        });
      } else if (!isArray) {
        return Object.values(controlsGroup).forEach((control) => {
          const { name } = control.field;
          const updatedValue = _get(
            values,
            [name],
            patch ? control.value : undefined
          );
          control.setValue(updatedValue, setAsDirty);
        });
      }
    } catch (error) {
      console.error('Could not set values!', { control: this, values, error });
    }
  }

  // Common

  get setRef() {
    return (ref: unknown): void => {
      return setRef(
        ref as MargaritaFormBaseElement,
        this as unknown as MargaritaFormControl
      );
    };
  }

  // Internal

  public override _enableChildren(value: boolean) {
    this.controls.forEach((control) => {
      control.updateStateValue('enabled', value);
    });
  }

  private _setState(): Subscription {
    const childStates: Observable<MargaritaFormState[]> =
      this.controlsController.controlChanges.pipe(
        switchMap((controls) => {
          if (!controls.length) return Promise.resolve([]);
          const stateChanges: Observable<MargaritaFormState>[] = controls.map(
            (control) => control.stateChanges
          );
          return combineLatest(stateChanges);
        })
      );

    return combineLatest([this._validationsState, childStates])
      .pipe(debounceTime(5))
      .subscribe(([validationStates, children]) => {
        const childrenAreValid = children.every(
          (child) => child.valid || child.inactive
        );
        const currentIsValid = Object.values(validationStates).every(
          (state) => state.valid
        );

        const validationResult = currentIsValid && childrenAreValid;
        const forceValid = this.state.pristine;
        const valid = forceValid || validationResult;
        const invalid = !valid;

        const errors = Object.entries(validationStates).reduce(
          (acc, [key, { error }]) => {
            if (error) acc[key] = error;
            return acc;
          },
          {} as MargaritaFormStateErrors
        );

        const hasValue = valueExists(this.value);
        const changes = {
          valid,
          invalid,
          errors,
          children,
          hasValue,
        };
        this.updateState(changes);
      });
  }
}
