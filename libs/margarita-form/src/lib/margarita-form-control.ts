import {
  combineLatest,
  interval,
  Observable,
  ObservableInput,
  Subscription,
} from 'rxjs';
import type {
  MargaritaFormControlBase,
  MargaritaFormField,
  MargaritaFormFieldValidation,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidatorOutput,
  MargaritaFormFieldValidatorResultEntry,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStatus,
} from './margarita-form-types';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, map, shareReplay, switchMap } from 'rxjs/operators';
import { defaultStatus } from './margarita-form-defaults';
import { MargaritaFormArray } from './margarita-form-array';
import { MargaritaFormGroup } from './margarita-form-group';

const validators: MargaritaFormFieldValidators = {
  function: ({ value }) => ({ valid: Boolean(value) }),
  asPromise: async ({ value }) => ({ valid: Boolean(value) }),
  asObservable: ({ params: intervalMs }) =>
    interval(intervalMs).pipe(
      map((i) => {
        const valid = i % 2 === 0;
        if (!valid) {
          return { valid, error: 'No zero!' };
        }
        return { valid };
      })
    ),
};

export class MargaritaFormControl<T = unknown>
  implements MargaritaFormControlBase<T>
{
  private _subscriptions: Subscription[];
  private _value = new BehaviorSubject<unknown>(undefined);
  private _status = new BehaviorSubject<MargaritaFormStatus>(defaultStatus);
  private _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});

  public ref: HTMLElement | null = null;
  constructor(
    public field: MargaritaFormField,
    public parent: MargaritaFormObjectControlTypes<unknown>,
    public root: MargaritaFormObjectControlTypes<unknown>,
    public validators?: MargaritaFormFieldValidators
  ) {
    if (field.initialValue) this.setValue(field.initialValue);
    const validationsStateSubscription = this._createValidationsState();
    this._subscriptions = [validationsStateSubscription];
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public get name(): string {
    return this.field.name;
  }

  public get statusChanges(): Observable<MargaritaFormStatus> {
    const observable = this._status.pipe(shareReplay(1));
    return observable;
  }

  public get status(): MargaritaFormStatus {
    return this._status.getValue();
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

  // Internal

  private _createValidationsState() {
    return this.valueChanges
      .pipe(
        debounceTime(10),
        switchMap((value) => {
          const validation: MargaritaFormFieldValidation = {
            function: true,
            asPromise: true,
            // asObservable: 1500,
          };
          const activeValidatorEntries = Object.entries(validation).reduce(
            (acc, [key, params]) => {
              const validatorFn = validators[key];
              if (typeof validatorFn !== 'undefined') {
                const validatorOutput = validatorFn({
                  value,
                  params,
                  field: this.field,
                  control: this,
                });

                const longTime = setTimeout(() => {
                  console.warn('Validator is taking long time to finish!', {
                    key,
                    params,
                    value,
                    field: this.field,
                    control: this,
                  });
                }, 2000);

                if (validatorOutput instanceof Observable) {
                  const observable = validatorOutput.pipe(
                    map((result) => {
                      clearTimeout(longTime);
                      return [key, result];
                    })
                  ) as Observable<MargaritaFormFieldValidatorResultEntry>;

                  acc.push([key, observable]);
                } else {
                  const promise = Promise.resolve(validatorOutput).then(
                    (result) => {
                      clearTimeout(longTime);
                      return [key, result];
                    }
                  ) as Promise<MargaritaFormFieldValidatorResultEntry>;
                  acc.push([key, promise]);
                }
              }
              return acc;
            },
            [] as [
              string,
              MargaritaFormFieldValidatorOutput<MargaritaFormFieldValidatorResultEntry>
            ][]
          );

          const activeValidators = activeValidatorEntries.map(
            (entry) => entry[1]
          ) as ObservableInput<MargaritaFormFieldValidatorResultEntry>[];

          return combineLatest(activeValidators).pipe(
            map((values: MargaritaFormFieldValidatorResultEntry[]) => {
              return Object.fromEntries(values);
            })
          );
        })
      )
      .subscribe((validationState) => {
        this._validationsState.next(validationState);
      });
  }
}
