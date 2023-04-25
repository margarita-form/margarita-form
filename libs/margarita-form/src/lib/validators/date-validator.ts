import { MargaritaFormValidator } from '../margarita-form-types';

export const dateValidator: (
  errorMessage?: string
) => MargaritaFormValidator<boolean> =
  (errorMessage = 'Please enter a valid date!') =>
  ({ value, params }) => {
    if (!params || !value) return { valid: true };
    const date = value instanceof Date ? value : new Date(String(value));
    const valid = Boolean(date.getTime());
    const error = !valid ? errorMessage : null;
    return { valid, error };
  };
