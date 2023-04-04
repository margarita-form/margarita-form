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

/**
 * Control that groups other controls together and inherits their value.
 * @typeParam T - Type of the value for the control
 * @typeParam F - Type of the field for the control
 */
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

  /**
   * Unsubscribe from all subscriptions for current control and all child controls
   */
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

  /**
   * Get the way how the child controls should be grouped
   */
  public get grouping(): MargaritaFormGroupings {
    return this.field.grouping || 'group';
  }

  /**
   * Check if control's output should be an array
   */
  public get expectArray(): boolean {
    return arrayGroupings.includes(this.grouping);
  }

  // Controls

  /**
   * Get all controls as an array
   */
  public override get controls(): MargaritaFormControlsArray<unknown, F> {
    return this.controlsController.controlsArray;
  }

  /**
   * Get control with identifier
   * @param identifier name, index or key of the control. Provide an array of identifiers to get nested control.
   * @returns The control that was found or added or null if control doesn't exist.
   */
  public override getControl<T = MargaritaFormControl<unknown, F>>(
    identifier: string | number | (string | number)[]
  ): T {
    if (Array.isArray(identifier)) {
      const [first, ...rest] = identifier;
      const control = this.controlsController.getControl(first);
      if (!control) return null as T;
      return control.getControl(rest) as T;
    }
    return this.controlsController.getControl(identifier) as T;
  }

  /**
   * Check if control exists
   * @param identifier name, index or key of the control
   * @returns boolean
   */
  public override hasControl(identifier: string | number): boolean {
    const control = this.controlsController.getControl(identifier);
    const exists = Boolean(control);
    return exists;
  }

  /**
   * Get control or add it if it doesn't exist.
   * NOTE: If grouping is array or repeat-group this method might not work as expected as arrays and repeat-groups allow multiple controls with the same name!
   * @param field The field to use as a template for the new control
   * @returns The control that was found or added
   */
  public override getOrAddControl<T = MargaritaFormControl<unknown, F>>(
    field: F
  ): T {
    const control = this.controlsController.getControl(field.name);
    if (!control) return this.controlsController.addControl(field) as T;
    return control as T;
  }

  /**
   * Add new control to the form group.
   * @param field The field to use as a template for the new control
   * @returns Control that was added
   */
  public override addControl<T = MargaritaFormControl<unknown, F>>(
    field: F
  ): T {
    return this.controlsController.addControl(field) as T;
  }

  /**
   * Removes a child control from the form group.
   * @param identifier name, index or key of the control to remove
   */
  public override removeControl(identifier: string) {
    this.controlsController.removeControl(identifier);
  }

  /**
   * Moves a child control to a new index in the array.
   * @param identifier name, index or key of the control to move
   * @param toIndex index to move the control to
   */
  public moveControl(identifier: string, toIndex: number) {
    this.controlsController.moveControl(identifier, toIndex);
  }

  /**
   * Add new controls to the form group array. If no field is provided, the template field or fields will be used.
   * @param field The field to use as a template for the new controls
   */
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

  /**
   * Remove the control from the parent
   */
  public remove() {
    this.parent.removeControl(this.key);
  }

  // Value

  /**
   * Get current value of the control
   */
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

  /**
   * Subscribe to value changes of the control.
   */
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

  /**
   * Set value of the control group by updating it's childrens values. Unlike patchValue, this method will delete children values if they are not present in the new value.
   * @param values value to set
   * @param setAsDirty update dirty state to true
   */
  public override setValue(values: unknown, setAsDirty = true) {
    this._updateGroupValue(values, setAsDirty, false);
  }

  /**
   * Set value of the control group by updating it's childrens values. Unlike setValue, this method will not delete children values if they are not present in the new value.
   * @param values value to set
   * @param setAsDirty update dirty state to true
   */
  public patchValue(values: unknown, setAsDirty = true) {
    this._updateGroupValue(values, setAsDirty, true);
  }

  /**
   * @internal
   */
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

  /**
   * Connect control to a HTML element.
   * NOTE: If target element is an input, it's recommended to only use this method with MargaritaFormValueControl as MargaritaFormHRoupControl expects a object as value!
   * @example React
   * ```jsx
   * <form ref={control.setRef} />
   * ```
   * @example Vanilla JS
   * ```js
   * const el = document.querySelector('#myForm');
   * control.setRef(el);
   * ```
   */
  get setRef() {
    return (ref: unknown): void => {
      return setRef(
        ref as MargaritaFormBaseElement,
        this as unknown as MargaritaFormControl
      );
    };
  }

  // Internal

  /**
   * @internal
   */
  public override _enableChildren(value: boolean) {
    this.controls.forEach((control) => {
      control.updateStateValue('enabled', value);
    });
  }

  /**
   * @internal
   */
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
