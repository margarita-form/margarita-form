import { BehaviorSubject, combineLatest, debounceTime, switchMap } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { CommonRecord, MFC } from '../margarita-form-types';
import { mapResolverEntries } from '../helpers/resolve-function-outputs';

export type Params = CommonRecord;

class ParamsManager<CONTROL extends MFC> extends BaseManager {
  private _params: Params = {};
  public changes = new BehaviorSubject<Params>({});

  constructor(public control: CONTROL) {
    super();

    const paramsSubscriptionObservable = combineLatest([control.valueChanges, control.stateChanges]).pipe(
      debounceTime(1),
      switchMap(([value]) => {
        return mapResolverEntries({
          title: 'Params',
          from: control.field.params || {},
          context: {
            control,
            value,
            params: null,
          },
        });
      })
    );

    this.createSubscription(paramsSubscriptionObservable, (params) => {
      this._params = params;
      this._emitChanges();
    });
  }

  private _emitChanges() {
    this.changes.next(this._params);
  }

  public get current() {
    return this._params;
  }
}

export { ParamsManager };
