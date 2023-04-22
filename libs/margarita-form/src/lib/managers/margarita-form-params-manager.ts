import { BehaviorSubject, combineLatest, debounceTime, switchMap } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import {
  CommonRecord,
  MFC,
  MargaritaFormFieldContext,
  MargaritaFormResolverOutput,
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
        switchMap(([value]) => {
          const { params } = control.field;
          if (!params) return Promise.resolve({});

          const context: MargaritaFormFieldContext<CONTROL> = {
            control,
            value,
            params: null,
          };

          const entries = Object.entries(params).reduce((acc, [key, param]) => {
            if (typeof param === 'function') {
              const result = param(context);
              acc.push([key, result]);
              return acc;
            }

            const resolverFn = control.resolvers[key];
            if (typeof resolverFn === 'function') {
              const result = resolverFn({ ...context, params: param });
              acc.push([key, result]);
              return acc;
            }

            return acc;
          }, [] as [string, MargaritaFormResolverOutput][]);

          return resolveFunctionOutputs('Params', context, entries);
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
