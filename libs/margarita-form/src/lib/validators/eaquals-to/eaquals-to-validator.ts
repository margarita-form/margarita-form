import { MargaritaFormValidator } from '../../margarita-form-types';

type EaqualsToValidatorParams = unknown;

export const eaqualsToValidator: (_params?: EaqualsToValidatorParams, errorMessage?: string) => MargaritaFormValidator<unknown> =
  (_params = undefined, defaultErrorMessage = 'Value does not eaqual to required value!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const valueIsInvalid = params !== value;
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
