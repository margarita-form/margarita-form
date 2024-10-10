import { valueIsDefined } from '../../helpers/check-value';
import { MargaritaFormValidator } from '../../typings/margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    equalsTo: ReturnType<typeof equalsToValidator>;
  }
}

type equalsToValidatorParams = unknown;

export const equalsToValidator: (_params?: equalsToValidatorParams, errorMessage?: string) => MargaritaFormValidator<unknown> =
  (_params = undefined, defaultErrorMessage = 'Value does not eaqual to required value!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !valueIsDefined(value)) return { valid: true };
    const valueIsInvalid = params !== value;
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
