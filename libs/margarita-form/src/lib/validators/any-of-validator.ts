import { MargaritaFormValidator } from '../margarita-form-types';

export const anyOfValidator: (errorMessage?: string) => MargaritaFormValidator<unknown[]> =
  (defaultErrorMessage = 'Value does not match any of the required values!') =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const valueIsInvalid = !params.includes(value);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
