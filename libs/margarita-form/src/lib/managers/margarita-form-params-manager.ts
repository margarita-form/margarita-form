/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable, switchMap } from 'rxjs';
import { BaseManager, ManagerName } from './margarita-form-base-manager';
import { CommonRecord, FieldParams, MFC, MFF, MargaritaFormResolver, NotFunction } from '../margarita-form-types';
import { getResolverOutputMapObservable } from '../helpers/resolve-function-outputs';
import { MargaritaFormControl } from '../margarita-form-control';

export type Params = CommonRecord;
export type MargaritaFormFieldParams = CommonRecord<NotFunction | MargaritaFormResolver<any>>;

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    params: ParamsManager<MFC>;
  }
}

declare module '../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF> {
    get params(): Params;
    get paramsChanges(): Observable<Params>;
  }
}

declare module '../margarita-form-types' {
  export interface MargaritaFormField<FP extends FieldParams = FieldParams> {
    params?: MargaritaFormFieldParams;
  }
}

export class ParamsManager<CONTROL extends MFC> extends BaseManager<Params> {
  public static override managerName: ManagerName = 'params';
  constructor(public override control: CONTROL) {
    super(control, {});

    MargaritaFormControl.extend({
      get params(): Params {
        return this.managers.params.value;
      },
      get paramsChanges(): Observable<Params> {
        return this.managers.params.changes;
      },
    });
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
