/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable, switchMap } from 'rxjs';
import { BaseManager, ManagerName } from './base-manager';
import {
  CommonRecord,
  FieldParams,
  MFC,
  MFF,
  MargaritaFormContextFunction,
  MargaritaFormResolver,
  MargaritaFormResolverOutput,
  NotFunction,
  ResolverParams,
} from '../typings/margarita-form-types';
import { getResolverOutput, getResolverOutputMapObservable, getResolverOutputMapSyncronous } from '../helpers/resolve-function-outputs';
import { MargaritaFormControl } from '../margarita-form-control';
import { valueIsAsync } from '../helpers/async-checks';

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

declare module '../typings/margarita-form-types' {
  export interface MargaritaFormField<FP extends FieldParams = FieldParams> {
    params?: MargaritaFormFieldParams;
  }
}

type ParamsValue<T> = ResolverParams | MargaritaFormResolverOutput<T> | MargaritaFormResolver<T>;
type ParamsSnapshotValue<T> = T | MargaritaFormContextFunction<T>;

export class Param<T = unknown> {
  constructor(public from: ParamsValue<T>, public snapshotValue?: ParamsSnapshotValue<T>) {}
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
    const syncronousParams = this._getCurrentParams(true);
    if (syncronousParams) {
      this.value = syncronousParams;
      this.emitChange(syncronousParams);
    }

    const paramsSubscriptionObservable = this.control.fieldChanges.pipe(
      switchMap(() => {
        const params = this._getCurrentParams(false);
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

  private _getCurrentParams(snapshot = false): null | Params {
    const { params = {}, ...rest } = this.control.field;
    let hasParams = false;
    const currentParams = {} as Params;

    const paramsReducer =
      (allowAny: boolean) =>
      (acc: Params, [key, value]: [string, any]) => {
        if (value instanceof Param) {
          hasParams = true;
          const fromValue = getResolverOutput({ getter: value.from, control: this.control });
          const fromIsAsync = valueIsAsync(fromValue);
          const syncronousValue = fromIsAsync ? value.snapshotValue : fromValue;
          acc[key] = snapshot ? syncronousValue : value.from;
        } else if (allowAny) {
          hasParams = true;
          acc[key] = value;
        }
        return acc;
      };

    Object.entries(params).reduce(paramsReducer(true), currentParams);
    Object.entries(rest).reduce(paramsReducer(false), currentParams);

    if (!hasParams) return null;
    if (snapshot) return getResolverOutputMapSyncronous(currentParams, this.control);
    return currentParams;
  }
}
