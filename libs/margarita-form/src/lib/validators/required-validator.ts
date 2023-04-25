import { MargaritaFormValidator } from '../margarita-form-types';

export const requiredValidator: (
  errorMessage?: string
) => MargaritaFormValidator<boolean> =
  (errorMessage = 'This field is required!') =>
  ({ value, params }) => {
    if (!params) return { valid: true };
    const invalidValues: unknown[] = [null, undefined, NaN, Infinity, ''];
    let valueIsInvalid = invalidValues.includes(value);
    if (!valueIsInvalid && value) {
      if (typeof value === 'string') valueIsInvalid = value.trim().length < 1;
      if (Array.isArray(value)) valueIsInvalid = value.length < 1;
      if (typeof value === 'object') Object.keys(value).length < 1;
    }
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
