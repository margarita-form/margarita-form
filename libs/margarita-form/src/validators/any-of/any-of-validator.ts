import { valueIsDefined } from '../../helpers/check-value';
import { MargaritaFormValidator } from '../../typings/margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    anyOf: ReturnType<typeof anyOfValidator>;
  }
}

type AnyOfValidatorParams = unknown[];

export const anyOfValidator: (_params?: AnyOfValidatorParams, errorMessage?: string) => MargaritaFormValidator<unknown[]> =
  (_params = undefined, defaultErrorMessage = 'Value does not match any of the required values!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !valueIsDefined(value)) return { valid: true };
    const valueIsInvalid = !params.includes(value);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
