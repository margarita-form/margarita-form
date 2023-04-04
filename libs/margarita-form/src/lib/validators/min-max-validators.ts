import { MargaritaFormValidatorFunction } from '../margarita-form-types';

const invalids: unknown[] = [undefined, null, NaN];

const compare = (value: unknown, comparisonFn: (value: number) => boolean) => {
  if (typeof value === 'number') return comparisonFn(value);
  if (typeof value === 'string') return comparisonFn(value.trim().length);
  if (Array.isArray(value)) return comparisonFn(value.length);
  if (typeof value === 'object' && value !== null)
    comparisonFn(Object.keys(value).length);
  return true;
};

export const minValidator: (
  errorMessage?: string
) => MargaritaFormValidatorFunction<number> =
  (errorMessage = 'Value is too low!') =>
  ({ value, params: minValue }) => {
    if (invalids.includes(minValue)) return { valid: true };
    if (invalids.includes(value)) return { valid: true };
    const valueIsInvalid = compare(value, (number) => number < minValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };

export const maxValidator: (
  errorMessage?: string
) => MargaritaFormValidatorFunction<number> =
  (errorMessage = 'Value is too high!') =>
  ({ value, params: maxValue }) => {
    if (invalids.includes(maxValue)) return { valid: true };
    if (invalids.includes(value)) return { valid: true };
    const valueIsInvalid = compare(value, (number) => number > maxValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
