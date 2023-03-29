import {
  MargaritaFormField,
  MargaritaFormFieldFunction,
} from '../margarita-form-types';

export const dateValidator: (
  errorMessage?: string
) => MargaritaFormFieldFunction<unknown, MargaritaFormField, boolean> =
  (errorMessage = 'Please enter a valid date!') =>
  ({ value, params }) => {
    if (!params) return { valid: true };
    const date = value instanceof Date ? value : new Date(String(value));
    const valueIsInvalid = Boolean(date.getTime());
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
