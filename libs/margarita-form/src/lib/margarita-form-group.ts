import type {
  CommonRecord,
  MargaritaFormBaseElement,
  MargaritaFormControlBase,
  MargaritaFormControls,
  MargaritaFormField,
  MargaritaFormFields,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStateChildren,
  MargaritaFormStateErrors,
} from './margarita-form-types';
import { debounceTime, Observable, Subscription } from 'rxjs';
import {
  BehaviorSubject,
  shareReplay,
  switchMap,
  map,
  combineLatest,
} from 'rxjs';
import _get from 'lodash.get';
import { MargaritaFormControl } from './margarita-form-control';
import { MargaritaFormArray } from './margarita-form-array';
import { _createValidationsState } from './core/margarita-form-validation';
import { createControlFromField } from './core/margarita-form-create-control';
import { MargaritaFormBase } from './core/margarita-form-base-class';
import { addRef } from './core/margarita-form-add-ref';

export class MargaritaFormGroup<T = CommonRecord>
  extends MargaritaFormBase
  implements MargaritaFormControlBase<T>
{
  private _controls = new BehaviorSubject<MargaritaFormControls<unknown>>({});

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

    const controls = this.transformFieldsToControls(field.fields);
    this._controls.next(controls);
    if (field.initialValue) this.setValue(field.initialValue);
    const validationsStateSubscription = this._setValidationsState();
    const stateSubscription = this._setState();
    this._subscriptions = [validationsStateSubscription, stateSubscription];
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    Object.values(this.controls).forEach((control) => {
      control.cleanup();
    });
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
    if (this.parent instanceof MargaritaFormArray) {
      return this.parent.findIndexForName(this.name);
    }
    return -1;
  }

  private transformFieldsToControls(fields?: MargaritaFormFields) {
    if (!fields) return {};
    const controls = fields.reduce((acc, field) => {
      const { name } = field;
      const control = createControlFromField(
        field,
        this,
        this.__root,
        this.validators
      );
      acc[name] = control;
      field.control = control;
      return acc;
    }, {} as MargaritaFormControls<unknown>);
    return controls;
  }

  public register(field: MargaritaFormField) {
    if (!this.field.fields) throw 'Could not register new field';
    this.field.fields.push(field);
    const { name } = field;
    const controls = this.controls;
    const control = createControlFromField(
      field,
      this,
      this.__root,
      this.validators
    );
    controls[name] = control;
    this._controls.next(controls);
  }

  public unregister(name: string) {
    const control = this.getControl(name);
    if (control) {
      control.cleanup();
      delete this.controls[name];
      this._controls.next(this.controls);
    } else {
      console.warn(`Could not find control named "${name}"!`, {
        controls: this.controls,
      });
    }
  }

  public remove() {
    if (this.parent instanceof MargaritaFormArray) {
      this.parent.removeControls(this.index);
    }
    if (this.parent instanceof MargaritaFormGroup) {
      this.parent.unregister(this.name);
    }
  }

  public setValue(value: unknown) {
    if (!this.controls) throw 'Cannot set value';
    Object.values(this.controls).forEach((control) => {
      const { name } = control.field;
      if (value && typeof value === 'object') {
        const updatedValue = _get(value, [name], control.value);
        control.setValue(updatedValue);
      } else {
        // control.setValue(null);
        throw 'Not yet implemented';
      }
    });
  }

  public get controls(): MargaritaFormControls<unknown> {
    return this._controls.value;
  }

  public getControl<T = MargaritaFormGroup | MargaritaFormControl>(
    name: string
  ) {
    return this.controls[name] as T;
  }

  public get value(): T {
    return Object.entries(this.controls).reduce(
      (acc: CommonRecord, [key, control]) => {
        acc[key] = control.value;
        return acc;
      },
      {}
    ) as T;
  }

  public get valueChanges(): Observable<T> {
    return this._controls.pipe(
      switchMap((controls) => {
        const valueChangesEntries = Object.entries(controls).map(
          ([key, control]) => {
            return control.valueChanges.pipe(
              map((value) => {
                return { key, value };
              })
            );
          }
        );

        const valueChanges = combineLatest(valueChangesEntries).pipe(
          map((values) => {
            return values.reduce((acc: CommonRecord, { key, value }) => {
              acc[key] = value;
              return acc;
            }, {});
          }),
          shareReplay(1)
        );

        return valueChanges as Observable<T>;
      })
    );
  }

  // Common

  get controlsArray() {
    console.warn(
      'Trying to access "controlsArray" which is not available for MargaritaFormGroup!',
      { context: this }
    );
    return null;
  }

  get setRef() {
    return (ref: unknown) => {
      return addRef(ref as MargaritaFormBaseElement, this);
    };
  }

  // Internal

  private _setValidationsState(): Subscription {
    return _createValidationsState(this).subscribe((validationState) => {
      this._validationsState.next(validationState);
    });
  }

  private _getChildStates() {
    return Object.values(this.controls).map((control) => control.stateChanges);
  }

  private _setState() {
    const childStates = combineLatest(this._getChildStates());

    return combineLatest([this._validationsState, childStates])
      .pipe(debounceTime(5))
      .subscribe(([validationStates, childStates]) => {
        const currentIsValid = Object.values(validationStates).every(
          (state) => state.valid
        );
        const childrenAreValid = childStates.every((child) => child.valid);

        const errors = Object.entries(validationStates).reduce(
          (acc, [key, { error }]) => {
            if (error) acc[key] = error;
            return acc;
          },
          {} as MargaritaFormStateErrors
        );

        const children = childStates.reduce((acc, child) => {
          if (!child.control) return acc;
          const { name } = child.control;
          return {
            ...acc,
            [name]: child,
          };
        }, {} as MargaritaFormStateChildren);

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
