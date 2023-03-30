import { combineLatest, Observable } from 'rxjs';
import type {
  MargaritaForm,
  MargaritaFormBaseElement,
  MargaritaFormControl,
  MargaritaFormField,
  MargaritaFormFieldValidators,
  MargaritaFormStateErrors,
} from './margarita-form-types';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, shareReplay } from 'rxjs/operators';
import { MargaritaFormBase } from './core/margarita-form-control-base';
import { setRef } from './core/margarita-form-control-set-ref';
import { MargaritaFormGroupControl } from './margarita-form-group-control';
import { valueExists } from './helpers/chack-value';

export class MargaritaFormValueControl<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> extends MargaritaFormBase<F> {
  private _value = new BehaviorSubject<unknown>(undefined);

  constructor(
    public override field: F,
    public override _parent?: MargaritaFormGroupControl<unknown, F> | null,
    public override _root?: MargaritaForm | null,
    public override _validators?: MargaritaFormFieldValidators
  ) {
    super(field, _parent, _root, _validators);
    if (field.initialValue) this.setValue(field.initialValue, false);
    const stateSubscription = this._setState();
    this._subscriptions.push(stateSubscription);
    this._init();
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.refs.forEach((ref) => {
      if (!ref || !ref.controls) return;
      const { controls = [] } = ref;
      const index = controls.findIndex((control) => control.key === this.key);
      if (index > -1) ref.controls.splice(index, 1);
    });
  }

  // Controls

  public moveToIndex(toIndex: number) {
    if (this.parent instanceof MargaritaFormGroupControl) {
      this.parent.controlsController.moveControl(this.key, toIndex);
    } else {
      console.warn('Could not move control!');
    }
  }

  public remove() {
    this.parent.removeControl(this.key);
  }

  // Value

  public override get valueChanges(): Observable<T> {
    const observable = this._value.pipe(shareReplay(1));
    return observable as Observable<T>;
  }

  public get value(): T {
    return this._value.getValue() as T;
  }

  public override setValue(value: unknown, setAsDirty = true) {
    this._value.next(value);
    if (setAsDirty) this.updateStateValue('dirty', true);
  }

  // Common

  get setRef() {
    return (ref: unknown): void => {
      return setRef(ref as MargaritaFormBaseElement, this as any);
    };
  }

  // Internal

  private _setState() {
    return combineLatest([this._validationsState])
      .pipe(debounceTime(5))
      .subscribe(([validationStates]) => {
        const validationResult = Object.values(validationStates).every(
          (state) => state.valid
        );
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
          hasValue,
        };
        this.updateState(changes);
      });
  }
}
