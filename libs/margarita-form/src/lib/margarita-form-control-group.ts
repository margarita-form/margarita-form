import {
  arrayGroupings,
  CommonRecord,
  MargaritaFormGroupings,
  MargaritaFormBaseElement,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStateErrors,
  MargaritaFormState,
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

export class MargaritaFormGroup<T = CommonRecord> extends MargaritaFormBase {
  public controlsController: ControlsController;
  private _subscriptions: Subscription[];
  private _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});

  constructor(
    public field: MargaritaFormField,
    private _parent?: MargaritaFormObjectControlTypes<unknown> | null,
    private _root?: MargaritaFormObjectControlTypes<unknown> | null,
    private _validators?: MargaritaFormFieldValidators
  ) {
    super();

    const _requireUniqueNames = this.grouping === 'group';
    this.controlsController = new ControlsController(
      this,
      this.__root,
      this.validators,
      _requireUniqueNames,
      field.fields
    );
    this.controlsController.addControls(field.fields);

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
      const index = controls.findIndex((control) => control === this);
      if (index > -1) ref.controls.splice(index, 1);
    });
  }

  private get grouping(): MargaritaFormGroupings {
    return this.field.grouping || 'group';
  }

  public get name(): string {
    return this.field.name;
  }

  public get parent(): MargaritaFormObjectControlTypes<unknown> {
    if (!this._parent) {
      console.warn('Root of controls reached!', this);
    }
    return this._parent || this;
  }

  public get root(): MargaritaFormObjectControlTypes<unknown> {
    if (!this._root) {
      console.warn('Root of controls already reached!', this);
    }
    return this.__root;
  }

  private get __root(): MargaritaFormObjectControlTypes<unknown> {
    return this._root || this;
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
      control.updateStateValue('disabled', true);
    });
  }

  // Controls

  public override get controls() {
    return this.controlsController.controlsArray;
  }

  public override getControl<T = MargaritaFormControlTypes>(
    identifier: string | number
  ): T {
    return this.controlsController.getControl(identifier) as T;
  }

  public override addControl(field: MargaritaFormField) {
    this.controlsController.addControl(field);
  }

  public override removeControl(identifier: string) {
    this.controlsController.removeControl(identifier);
  }

  public remove() {
    this.parent.removeControl(this.key);
  }

  // Value

  public get value(): T {
    const { controlsArray } = this.controlsController;
    const { grouping = 'group' } = this.field;
    const expectArray = arrayGroupings.includes(grouping);
    if (expectArray) {
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
        const valueChangesEntries = controls.map((control) => {
          return control.valueChanges.pipe(
            map((value) => {
              return { control, value };
            })
          );
        });

        const valueChanges = combineLatest(valueChangesEntries).pipe(
          map((changeEntries) => {
            const { grouping = 'group' } = this.field;
            const expectArray = arrayGroupings.includes(grouping);
            if (expectArray) {
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
      const { grouping = 'group' } = this.field;
      const { controlsArray, controlsGroup } = this.controlsController;
      const expectArray = arrayGroupings.includes(grouping);
      const isArray = Array.isArray(values);
      if (expectArray && isArray) {
        controlsArray.forEach((control, index) => {
          const hasValue = control && values[index];
          if (!hasValue) control.remove();
        });

        values.forEach((value, index) => {
          const control = controlsArray[index];
          if (control) return control.setValue(value);
          if (grouping === 'repeat-group') {
            this.controlsController.appendRepeatingControlGroup(
              this.field.fields,
              value
            );
          }
        });
      } else if (!isArray) {
        Object.values(controlsGroup).forEach((control) => {
          const { name } = control.field;
          const updatedValue = _get(values, [name], control.value);
          control.setValue(updatedValue);
        });
      }
    } catch (error) {
      console.error('Could not set values!', { control: this, values, error });
    }
    throw 'Could not set value!';
  }

  // Common

  get setRef() {
    return (ref: unknown): void => {
      return setRef(ref as MargaritaFormBaseElement, this);
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
    const childStates = this.controlsController.controlChanges.pipe(
      switchMap((controls) => {
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
        const valid = currentIsValid && childrenAreValid;
        const changes = {
          valid,
          errors,
          children,
        };
        this.updateState(changes);
      });
  }
}
