import type { Observable, Subscription } from 'rxjs';
import type {
  MargaritaFormControlBase,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormStatus,
} from './margarita-form-types';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, shareReplay } from 'rxjs/operators';
import { MargaritaFormGroup } from './margarita-form-group';
import { defaultStatus } from './margarita-form-defaults';

export class MargaritaFormControl<T = unknown>
  implements MargaritaFormControlBase<T>
{
  private _value = new BehaviorSubject<unknown>(undefined);
  private _status = new BehaviorSubject<MargaritaFormStatus>(defaultStatus);
  private _subscriptions: Subscription[];

  public ref: HTMLElement | null = null;
  constructor(
    public field: MargaritaFormField,
    public parent?: MargaritaFormControlTypes<unknown>,
    public root?: MargaritaFormGroup<unknown>
  ) {
    if (field.initialValue) this.setValue(field.initialValue);
    const valueChangesSubscription = this.valueChanges.subscribe((value) => {
      /*
      console.log({
        field,
        control: this,
        value,
      });
      */
    });

    this._subscriptions = [valueChangesSubscription];
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
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
}
