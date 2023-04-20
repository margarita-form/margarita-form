import { BehaviorSubject, combineLatest, debounceTime, switchMap } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import {
  CommonRecord,
  MFC,
  MargaritaFormFieldContext,
  MargaritaFormFieldFunctionOutput,
} from '../margarita-form-types';
import { resolveFunctionOutputs } from '../helpers/resolve-function-outputs';

export type Params = CommonRecord | null;

class ParamsManager<CONTROL extends MFC> extends BaseManager {
  #params: Params = null;
  public changes = new BehaviorSubject<Params>(null);

  constructor(public control: CONTROL) {
    super();
    const paramsSubscription = combineLatest([
      control.valueChanges,
      control.stateChanges,
    ])
      .pipe(
        debounceTime(1),
        switchMap(([value, state]) => {
          const { params } = control.field;
          if (!params) return Promise.resolve({});

          const context: MargaritaFormFieldContext<CONTROL> = {
            control,
            value,
            params: state,
          };

          const entries = Object.entries(params).map(([key, value]) => {
            if (typeof value === 'function') {
              const result = value(context);
              return [key, result];
            }
            return [key, value];
          }) as [string, MargaritaFormFieldFunctionOutput<unknown>][];

          return resolveFunctionOutputs('State', context, entries);
        })
      )
      .subscribe((params) => {
        this.#params = params;
        this.#emitChanges();
      });

    this.subscriptions.push(paramsSubscription);
  }

  #emitChanges() {
    this.changes.next(this.#params);
  }

  public get current() {
    return this.#params;
  }
}

export { ParamsManager };
