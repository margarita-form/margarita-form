import { interval, map } from 'rxjs';
import { MargaritaFormFieldValidators } from '../margarita-form-types';

export const validators: MargaritaFormFieldValidators = {
  function: ({ value }) => ({ valid: Boolean(value) }),
  asPromise: async ({ value }) => ({ valid: Boolean(value) }),
  asObservable: ({ params: intervalMs }) =>
    interval(intervalMs).pipe(
      map((i) => {
        const valid = i % 2 === 0;
        if (!valid) {
          return { valid, error: 'No zero!' };
        }
        return { valid };
      })
    ),
};
