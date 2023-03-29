import {
  MargaritaFormField,
  MargaritaFormFieldFunction,
} from '../margarita-form-types';

export const urlValidator: (
  errorMessage?: string
) => MargaritaFormFieldFunction<unknown, MargaritaFormField, boolean> =
  (errorMessage = 'Please enter a valid url!') =>
  ({ value, params }) => {
    if (!params) return { valid: true };
    const regex = new RegExp(/https?:\/\/.+\..+/g);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
