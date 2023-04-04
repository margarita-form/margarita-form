import { combineLatest, debounceTime, switchMap } from 'rxjs';
import { resolveFunctionOutputs } from '../helpers/resolve-function-outputs';
import type {
  MargaritaFormControl,
  MargaritaFormField,
  MargaritaFormFieldContext,
  MargaritaFormFieldFunctionOutput,
} from '../margarita-form-types';

export const _createParams = <
  F extends MargaritaFormField = MargaritaFormField
>(
  control: MargaritaFormControl<unknown, F>
) => {
  const { field } = control;
  return combineLatest([control.valueChanges, control.stateChanges]).pipe(
    debounceTime(5),
    switchMap(([value, state]) => {
      const context = {
        control,
        value,
        field,
        params: state,
      } as unknown as MargaritaFormFieldContext<boolean>;

      const { params } = control.field;

      if (!params) return Promise.resolve({});

      const entries = Object.entries(params).map(([key, value]) => {
        if (typeof value === 'function') {
          const result = value(context);
          return [key, result];
        }
        return [key, value];
      }) as [string, MargaritaFormFieldFunctionOutput<unknown>][];

      return resolveFunctionOutputs('State', context, entries);
    })
  );
};
