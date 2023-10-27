import { MargaritaFormValidator } from '../margarita-form-types';

export const eaqualsToValidator: (errorMessage?: string) => MargaritaFormValidator<unknown> =
  (defaultErrorMessage = 'Value does not eaqual to required value!') =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const valueIsInvalid = params !== value;
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
