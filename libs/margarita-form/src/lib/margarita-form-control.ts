import { combineLatest, Observable, Subscription } from 'rxjs';
import type {
  MargaritaFormControlBase,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormState,
  MargaritaFormStateErrors,
} from './margarita-form-types';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, shareReplay } from 'rxjs/operators';
import { getDefaultState } from './margarita-form-defaults';
import { MargaritaFormArray } from './margarita-form-array';
import { MargaritaFormGroup } from './margarita-form-group';
import { _createValidationsState } from './core/margarita-form-validation';

export class MargaritaFormControl<T = unknown>
  implements MargaritaFormControlBase<T>
{
  private _subscriptions: Subscription[];
  private _value = new BehaviorSubject<unknown>(undefined);
  private _state: BehaviorSubject<MargaritaFormState>;
  private _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});

  public ref: HTMLElement | null = null;
  constructor(
    public field: MargaritaFormField,
    public _parent?: MargaritaFormObjectControlTypes<unknown> | null,
    public _root?: MargaritaFormObjectControlTypes<unknown> | null,
    public _validators?: MargaritaFormFieldValidators
  ) {
    const defaultState = getDefaultState(this);
    this._state = new BehaviorSubject<MargaritaFormState>(defaultState);
    if (field.initialValue) this.setValue(field.initialValue);
    const validationsStateSubscription = this._setValidationsState();
    const stateSubscription = this._setState();
    this._subscriptions = [validationsStateSubscription, stateSubscription];
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

  public get stateChanges(): Observable<MargaritaFormState> {
    const observable = this._state.pipe(shareReplay(1));
    return observable;
  }

  public get state(): MargaritaFormState {
    return this._state.getValue();
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

  public setRef(node: HTMLElement | null) {
    this.ref = node;
    if (node) {
      const updateValue = this.valueChanges.subscribe((value) => {
        if ('value' in node) {
          node.value = value || '';
        }
      });

      const handleChange = fromEvent(node, 'keydown')
        .pipe(debounceTime(50))
        .subscribe(() => {
          if ('value' in node) {
            this.setValue(node.value);
          }
        });

      const mutationObserver = new MutationObserver((events) => {
        events.forEach((event) => {
          event.removedNodes.forEach((removedNode) => {
            if (removedNode === node) {
              updateValue.unsubscribe();
              handleChange.unsubscribe();
              mutationObserver.disconnect();
            }
          });
        });
      });

      if (node.parentNode) {
        mutationObserver.observe(node.parentNode, { childList: true });
      }
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

  private _setState() {
    return combineLatest([this._validationsState])
      .pipe(debounceTime(10))
      .subscribe(([validationStates]) => {
        const currentState = this.state;
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
        const newState = {
          ...currentState,
          valid,
          errors,
        };
        this._state.next(newState);
      });
  }
}
