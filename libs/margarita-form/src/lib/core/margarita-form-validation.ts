import type {
  MargaritaFormControl,
  MargaritaFormField,
  MargaritaFormFieldFunction,
  MargaritaFormFieldFunctionOutputResultEntry,
} from '../margarita-form-types';
import {
  debounceTime,
  switchMap,
  Observable,
  map,
  ObservableInput,
  combineLatest,
  skip,
} from 'rxjs';

export const _createValidationsState = <
  F extends MargaritaFormField = MargaritaFormField
>(
  control: MargaritaFormControl<unknown, F>,
  _skip: number
) => {
  return control.valueChanges.pipe(
    debounceTime(1),
    skip(_skip),
    switchMap((value) => {
      if (!control.field.validation) return Promise.resolve({});
      const activeValidatorEntries = Object.entries(
        control.field.validation
      ).reduce((acc, [key, validationValue]) => {
        const validateFunction = (
          validatorFn: MargaritaFormFieldFunction,
          params: unknown
        ) => {
          const validatorOutput = validatorFn<F>({
            value,
            params,
            field: control.field,
            control,
          });

          const longTime = setTimeout(() => {
            console.warn('Validator is taking long time to finish!', {
              key,
              params,
              value,
              field: control.field,
              control: this,
            });
          }, control.root.asyncFunctionWarningTimeout);

          if (validatorOutput instanceof Observable) {
            const observable = validatorOutput.pipe(
              map((result) => {
                clearTimeout(longTime);
                return [key, result];
              })
            ) as Observable<MargaritaFormFieldFunctionOutputResultEntry>;

            acc.push(observable);
          } else {
            const promise = Promise.resolve(validatorOutput).then((result) => {
              clearTimeout(longTime);
              return [key, result];
            }) as Promise<MargaritaFormFieldFunctionOutputResultEntry>;
            acc.push(promise);
          }
        };
        const validatorFn = control.validators[key];
        if (typeof validationValue === 'function') {
          validateFunction(validationValue as MargaritaFormFieldFunction, null);
        } else if (typeof validatorFn !== 'undefined') {
          validateFunction(validatorFn, validationValue);
        }
        return acc;
      }, [] as ObservableInput<MargaritaFormFieldFunctionOutputResultEntry>[]);

      if (activeValidatorEntries.length === 0) return Promise.resolve({});

      return combineLatest(activeValidatorEntries).pipe(
        map((values: MargaritaFormFieldFunctionOutputResultEntry[]) => {
          return Object.fromEntries(values);
        })
      );
    })
  );
};
