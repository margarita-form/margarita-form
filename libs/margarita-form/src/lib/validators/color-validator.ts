import { MargaritaFormValidator } from '../margarita-form-types';

export const colorValidator: (errorMessage?: string) => MargaritaFormValidator<boolean> =
  (defaultErrorMessage = 'Value must be a valid color code!') =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/#[0-9a-zA-Z]{3,8}|(rgba?|hsla?)\([^,]{1,4},[^,]{1,4},[^,]{1,4}(,[^,]{1,3})?\)/gi);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
