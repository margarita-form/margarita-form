import { MargaritaFormValidatorFunction } from '../margarita-form-types';

export const minValidator: (
  errorMessage?: string
) => MargaritaFormValidatorFunction<number> =
  (errorMessage = 'Value is too low!') =>
  ({ value, params: minValue }) => {
    if (!minValue) return { valid: true };
    let valueIsInvalid = false;
    if (!valueIsInvalid && value) {
      if (typeof value === 'number') value < minValue;
      if (typeof value === 'string')
        valueIsInvalid = value.trim().length < minValue;
      if (Array.isArray(value)) valueIsInvalid = value.length < minValue;
      if (typeof value === 'object') Object.keys(value).length < minValue;
    }
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };

export const maxValidator: (
  errorMessage?: string
) => MargaritaFormValidatorFunction<number> =
  (errorMessage = 'Value is too high!') =>
  ({ value, params: minValue }) => {
    if (!minValue) return { valid: true };
    let valueIsInvalid = false;
    if (!valueIsInvalid && value) {
      if (typeof value === 'number') value > minValue;
      if (typeof value === 'string')
        valueIsInvalid = value.trim().length > minValue;
      if (Array.isArray(value)) valueIsInvalid = value.length > minValue;
      if (typeof value === 'object') Object.keys(value).length > minValue;
    }
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
