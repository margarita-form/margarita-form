import { MargaritaFormFieldValidatorFunction } from '../margarita-form-types';

export const requiredValidator: (
  errorMessage?: string
) => MargaritaFormFieldValidatorFunction =
  (errorMessage = 'This field is required!') =>
  ({ value }) => {
    const invalidValues: unknown[] = [null, undefined, NaN, ''];
    let valueIsInvalid = invalidValues.includes(value);
    if (!valueIsInvalid && value) {
      if (typeof value === 'string') valueIsInvalid = value.trim().length < 1;
      if (Array.isArray(value)) valueIsInvalid = value.length < 1;
      if (typeof value === 'object') Object.keys(value).length < 1;
    }
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
