import { MargaritaFormValidatorFunction } from '../margarita-form-types';

export const numberValidator: (
  errorMessage?: string
) => MargaritaFormValidatorFunction<boolean> =
  (errorMessage = 'Please enter a valid number!') =>
  ({ value, params }) => {
    if (!params) return { valid: true };
    const regex = new RegExp(/\d+/g);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
