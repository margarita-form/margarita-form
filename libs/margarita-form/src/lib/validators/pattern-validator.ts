import {
  MargaritaFormField,
  MargaritaFormFieldFunction,
  MargaritaFormFieldValidatorResult,
} from '../margarita-form-types';

export const patternValidator: (
  errorMessage?: string
) => MargaritaFormFieldFunction<
  unknown,
  MargaritaFormFieldValidatorResult,
  MargaritaFormField,
  string | RegExp
> =
  (errorMessage = 'Value does not match required pattern!') =>
  ({ value, params }) => {
    if (!params) return { valid: true };
    const regex = new RegExp(params);
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
