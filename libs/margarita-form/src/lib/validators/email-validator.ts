import { MargaritaFormValidatorFunction } from '../margarita-form-types';

export const emailValidator: (
  errorMessage?: string
) => MargaritaFormValidatorFunction<boolean> =
  (errorMessage = 'Value must be a valid email address!') =>
  ({ value, params }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/.+@.+\..+/g);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
