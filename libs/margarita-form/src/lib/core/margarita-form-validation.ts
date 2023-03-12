import type {
  MargaritaFormControlTypes,
  MargaritaFormFieldFunctionOutput,
  MargaritaFormFieldValidatorResultEntry,
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

export const _createValidationsState = (control: MargaritaFormControlTypes) => {
  return control.valueChanges.pipe(
    debounceTime(5),
    skip(control.field.initialValue ? 1 : 0),
    switchMap((value) => {
      const activeValidatorEntries = Object.entries(
        control.field.validation || {}
      ).reduce((acc, [key, params]) => {
        const validatorFn = control.validators[key];
        if (typeof validatorFn !== 'undefined') {
          const validatorOutput = validatorFn({
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
          }, 2000);

          if (validatorOutput instanceof Observable) {
            const observable = validatorOutput.pipe(
              map((result) => {
                clearTimeout(longTime);
                return [key, result];
              })
            ) as Observable<MargaritaFormFieldValidatorResultEntry>;

            acc.push([key, observable]);
          } else {
            const promise = Promise.resolve(validatorOutput).then((result) => {
              clearTimeout(longTime);
              return [key, result];
            }) as Promise<MargaritaFormFieldValidatorResultEntry>;
            acc.push([key, promise]);
          }
        }
        return acc;
      }, [] as [string, MargaritaFormFieldFunctionOutput<MargaritaFormFieldValidatorResultEntry>][]);

      const activeValidators = activeValidatorEntries.map(
        (entry) => entry[1]
      ) as ObservableInput<MargaritaFormFieldValidatorResultEntry>[];

      return combineLatest(activeValidators).pipe(
        map((values: MargaritaFormFieldValidatorResultEntry[]) => {
          return Object.fromEntries(values);
        })
      );
    })
  );
};
