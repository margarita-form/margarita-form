import { BehaviorSubject, combineLatest, debounceTime, switchMap } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { CommonRecord, MFC } from '../margarita-form-types';
import { mapResolverEntries } from '../helpers/resolve-function-outputs';

export type Params = CommonRecord | null;

class ParamsManager<CONTROL extends MFC> extends BaseManager {
  #params: Params = null;
  public changes = new BehaviorSubject<Params>(null);

  constructor(public control: CONTROL) {
    super();

    const paramsSubscriptionObservable = combineLatest([
      control.valueChanges,
      control.stateChanges,
    ]).pipe(
      debounceTime(1),
      switchMap(([value]) => {
        return mapResolverEntries('Params', control.field.params, {
          control,
          value,
          params: null,
        });
      })
    );

    this.createSubscription(paramsSubscriptionObservable, (params) => {
      this.#params = params;
      this.#emitChanges();
    });
  }

  #emitChanges() {
    this.changes.next(this.#params);
  }

  public get current() {
    return this.#params;
  }
}

export { ParamsManager };
