import { MargaritaFormValidator } from '../margarita-form-types';

export const numberValidator: (errorMessage?: string) => MargaritaFormValidator<boolean> =
  (defaultErrorMessage = 'Please enter a valid number!') =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    const invalidValues: unknown[] = [null, undefined, ''];
    if (!params || invalidValues.includes(value)) return { valid: true };
    const regex = new RegExp(/\d+/g);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
