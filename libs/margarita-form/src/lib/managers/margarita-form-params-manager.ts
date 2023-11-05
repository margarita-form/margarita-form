import { Observable, switchMap } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { CommonRecord, MFC, MFF } from '../margarita-form-types';
import { getResolverOutputMapObservable } from '../helpers/resolve-function-outputs';
import { MargaritaForm } from '../margarita-form';

export type Params = CommonRecord;

// Extends types
declare module '@margarita-form/core' {
  export interface Managers {
    params: ParamsManager<MFC>;
  }

  export interface MargaritaFormControl<FIELD extends MFF> {
    get params(): Params;
    get paramsChanges(): Observable<Params>;
  }
}

// Implementation

MargaritaForm.extend({
  get params() {
    return this.managers.params.value;
  },
  get paramsChanges() {
    return this.managers.params.changes;
  },
});

export class ParamsManager<CONTROL extends MFC> extends BaseManager<Params> {
  constructor(public override control: CONTROL) {
    super('params', control, {});
  }

  public override onInitialize() {
    const paramsSubscriptionObservable = this.control.fieldChanges.pipe(
      switchMap(() => {
        const { params } = this.control.field;
        if (!params) return Promise.resolve(null);
        return getResolverOutputMapObservable(params, this.control);
      })
    );

    this.createSubscription(paramsSubscriptionObservable, (params) => {
      if (!params) return;
      this.value = params;
      this.emitChange(params);
    });
  }
}
