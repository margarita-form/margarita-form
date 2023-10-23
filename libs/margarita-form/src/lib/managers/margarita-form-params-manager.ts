import { combineLatest, debounceTime, switchMap } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { CommonRecord, MFC } from '../margarita-form-types';
import { getResolverOutputMapObservable } from '../helpers/resolve-function-outputs';

export type Params = CommonRecord;

class ParamsManager<CONTROL extends MFC> extends BaseManager<Params> {
  constructor(public override control: CONTROL) {
    super('params', control, {});
  }

  public override onInitialize() {
    const paramsSubscriptionObservable = combineLatest([this.control.valueChanges, this.control.stateChanges]).pipe(
      debounceTime(1),
      switchMap(() => {
        const { params = {} } = this.control.field;
        return getResolverOutputMapObservable(params, this.control);
      })
    );

    this.createSubscription(paramsSubscriptionObservable, (params) => {
      this.value = params;
      this._emitChanges();
    });
  }

  private _emitChanges() {
    this.emitChange(this.value);
  }
}

export { ParamsManager };
