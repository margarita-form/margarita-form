import { MargaritaFormValidator } from '../margarita-form-types';

export const phoneValidator: (errorMessage?: string) => MargaritaFormValidator<boolean> =
  (errorMessage = 'Value must be a valid phone number!') =>
  ({ value, params }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/\+?[0-9\s]{3,30}/gi);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
