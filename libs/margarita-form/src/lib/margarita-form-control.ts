import { combineLatest, Observable, Subscription } from 'rxjs';
import type {
  MargaritaFormControlBase,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStateErrors,
} from './margarita-form-types';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, shareReplay, skip } from 'rxjs/operators';
import { MargaritaFormArray } from './margarita-form-array';
import { MargaritaFormGroup } from './margarita-form-group';
import { _createValidationsState } from './core/margarita-form-validation';
import { MargaritaFormBase } from './core/margarita-form-base-class';

export class MargaritaFormControl<T = unknown>
  extends MargaritaFormBase
  implements MargaritaFormControlBase<T>
{
  private _subscriptions: Subscription[];
  private _value = new BehaviorSubject<unknown>(undefined);
  private _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});
  constructor(
    public field: MargaritaFormField,
    public _parent?: MargaritaFormObjectControlTypes<unknown> | null,
    public _root?: MargaritaFormObjectControlTypes<unknown> | null,
    public _validators?: MargaritaFormFieldValidators
  ) {
    super();

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
  }

  public get name(): string {
    return this.field.name;
  }

  public get parent(): MargaritaFormControlTypes<unknown> {
    if (!this._parent) {
      console.warn('Root of controls reached!', this);
    }
    return this._parent || this;
  }

  public get root(): MargaritaFormControlTypes<unknown> {
    if (!this._root) {
      console.warn('Root of controls already reached!', this);
    }
    return this._root || this;
  }

  public get validators(): MargaritaFormFieldValidators {
    return this._validators || this.root.validators;
  }

  public get valueChanges(): Observable<T> {
    const observable = this._value.pipe(shareReplay(1));
    return observable as Observable<T>;
  }

  public get value(): T {
    return this._value.getValue() as T;
  }

  public setValue(value: unknown) {
    this._value.next(value);
  }

  public get index(): number {
    if (this.parent instanceof MargaritaFormArray) {
      return this.parent.findIndexForName(this.name);
    }
    return -1;
  }

  public remove() {
    if (this.parent instanceof MargaritaFormArray) {
      this.parent.removeControls(this.index);
    }
    if (this.parent instanceof MargaritaFormGroup) {
      this.parent.unregister(this.name);
    }
  }

  // Common
  get controls() {
    console.warn(
      'Trying to access "controls" which is not available for MargaritaFormControl!',
      { context: this }
    );
    return null;
  }

  get controlsArray() {
    console.warn(
      'Trying to access "controlsArray" which is not available for MargaritaFormControl!',
      { context: this }
    );
    return null;
  }

  public getControl(name: string) {
    console.warn(
      'Trying to use method "getControl" which is not available for MargaritaFormControl!',
      { name, context: this }
    );
    return null;
  }

  // Internal

  private _setValidationsState(): Subscription {
    return _createValidationsState(this).subscribe((validationState) => {
      this._validationsState.next(validationState);
    });
  }

  private _setDirtyState() {
    return this.valueChanges
      .pipe(skip(this.field.initialValue ? 1 : 0))
      .subscribe(() => {
        this.updateStateValue('dirty', true);
      });
  }

  private _setState() {
    return combineLatest([this._validationsState])
      .pipe(debounceTime(5))
      .subscribe(([validationStates]) => {
        const valid = Object.values(validationStates).every(
          (state) => state.valid
        );

        const errors = Object.entries(validationStates).reduce(
          (acc, [key, { error }]) => {
            if (error) acc[key] = error;
            return acc;
          },
          {} as MargaritaFormStateErrors
        );

        const changes = {
          valid,
          errors,
        };

        this.updateState(changes);
      });
  }
}
