import {
  arrayGroupings,
  MargaritaFormGroupings,
  MargaritaFormBaseElement,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStateErrors,
  MargaritaFormState,
  MargaritaForm,
  MargaritaFormControlsArray,
} from './margarita-form-types';
import { debounceTime, Observable, skip, Subscription } from 'rxjs';
import {
  BehaviorSubject,
  shareReplay,
  switchMap,
  map,
  combineLatest,
} from 'rxjs';
import _get from 'lodash.get';
import { _createValidationsState } from './core/margarita-form-validation';
import { ControlsController } from './core/margarita-form-create-controls';
import { MargaritaFormBase } from './core/margarita-form-control-base';
import { setRef } from './core/margarita-form-control-set-ref';

export class MargaritaFormGroup<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> extends MargaritaFormBase<F> {
  public controlsController: ControlsController<F>;
  private _subscriptions: Subscription[];
  private _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});

  constructor(
    public field: F,
    private _parent?: MargaritaFormObjectControlTypes<unknown, F> | null,
    private _root?: MargaritaForm | null,
    private _validators?: MargaritaFormFieldValidators
  ) {
    super();

    this.controlsController = new ControlsController(this);

    if (field.initialValue) this.setValue(field.initialValue);
    const validationsStateSubscription = this._setValidationsState();
    const dirtyStateSubscription = this._setDirtyState();
    const stateSubscription = this._setState();
    this._subscriptions = [
      validationsStateSubscription,
      dirtyStateSubscription,
      stateSubscription,
    ];
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

  public get name(): string {
    return this.field.name;
  }

  public get parent(): MargaritaFormObjectControlTypes<unknown, F> {
    if (!this._parent) {
      console.warn('Root of controls reached!', this);
    }
    return this._parent || this;
  }

  public get root(): MargaritaForm {
    return this._root || (this as unknown as MargaritaForm);
  }

  public get validators(): MargaritaFormFieldValidators {
    return this._validators || this.root.validators;
  }

  public get index(): number {
    if (this.parent instanceof MargaritaFormGroup) {
      return this.parent.controlsController.getControlIndex(this.key);
    }
    return -1;
  }

  // State

  public override enable() {
    this.updateStateValue('enabled', true);
    this.controls.forEach((control) => {
      control.updateStateValue('enabled', true);
    });
  }

  public override disable() {
    this.updateStateValue('disabled', true);
    this.controls.forEach((control) => {
      control.disable();
    });
  }

  // Controls

  public override get controls(): MargaritaFormControlsArray<unknown, F> {
    return this.controlsController.controlsArray;
  }

  public override getControl<T = MargaritaFormControlTypes<unknown, F>>(
    identifier: string | number
  ): T {
    return this.controlsController.getControl(identifier) as T;
  }

  public override hasControl(identifier: string | number): boolean {
    const control = this.controlsController.getControl(identifier);
    const exists = Boolean(control);
    return exists;
  }

  public override getOrAddControl<T = MargaritaFormControlTypes<unknown, F>>(
    field: F
  ): T {
    const control = this.controlsController.getControl(field.name);
    if (!control) return this.controlsController.addControl(field) as T;
    return control as T;
  }

  public override addControl<T = MargaritaFormControlTypes<unknown, F>>(
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
    if (this.expectArray) {
      return controlsArray.map((control) => control.value) as T;
    }
    const entries = controlsArray.map((control) => {
      return [control.name, control.value];
    });
    return Object.fromEntries(entries);
  }

  public get valueChanges(): Observable<T> {
    return this.controlsController.controlChanges.pipe(
      switchMap((controls) => {
        if (!controls.length) return Promise.resolve(null as T);

        const valueChangesEntries = controls.map((control) => {
          return control.valueChanges.pipe(
            map((value) => {
              return { control, value };
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

  public setValue(values: unknown) {
    try {
      const { controlsArray, controlsGroup } = this.controlsController;
      const isArray = Array.isArray(values);
      if (this.expectArray && isArray) {
        controlsArray.forEach((control, index) => {
          const hasValue = control && values[index];
          if (!hasValue) control.remove();
        });

        values.forEach((value, index) => {
          const control = this.controlsController.getControl(index);
          if (control) return control.setValue(value);
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
          const updatedValue = _get(values, [name], control.value);
          control.setValue(updatedValue);
        });
      }
    } catch (error) {
      console.error('Could not set values!', { control: this, values, error });
    }
    // throw 'Could not set value!';
  }

  // Common

  get setRef() {
    return (ref: unknown): void => {
      return setRef(
        ref as MargaritaFormBaseElement,
        this as unknown as MargaritaFormControlTypes
      );
    };
  }

  // Internal

  private _setValidationsState(): Subscription {
    return _createValidationsState(this).subscribe((validationState) => {
      this._validationsState.next(validationState);
    });
  }

  private _setDirtyState() {
    return this.valueChanges.pipe(skip(1)).subscribe(() => {
      this.updateStateValue('dirty', true);
    });
  }

  private _setState() {
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
        const childrenAreValid = children.every((child) => child.valid);
        const currentIsValid = Object.values(validationStates).every(
          (state) => state.valid
        );
        const errors = Object.entries(validationStates).reduce(
          (acc, [key, { error }]) => {
            if (error) acc[key] = error;
            return acc;
          },
          {} as MargaritaFormStateErrors
        );
        const validationResult = currentIsValid && childrenAreValid;
        const forceValid = this.state.pristine;
        const valid = forceValid || validationResult;
        const invalid = !valid;
        const changes = {
          valid,
          invalid,
          errors,
          children,
        };
        this.updateState(changes);
      });
  }
}
