import { MargaritaFormValidator } from '../../typings/margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    min: ReturnType<typeof minValidator>;
    max: ReturnType<typeof maxValidator>;
  }
}

type MinMaxValidatorParams = number | undefined;

const invalids: unknown[] = [undefined, null, ''];

const compare = (value: unknown, comparisonFn: (value: number) => boolean) => {
  if (typeof value === 'number') return comparisonFn(value);
  if (typeof value === 'string') return comparisonFn(value.trim().length);
  if (Array.isArray(value)) return comparisonFn(value.length);
  if (typeof value === 'object' && value !== null) comparisonFn(Object.keys(value).length);
  return true;
};

export const minValidator: (_params?: MinMaxValidatorParams, errorMessage?: string) => MargaritaFormValidator<number> =
  (_params = undefined, defaultErrorMessage = 'Value is too low!') =>
  ({ value, params: minValue = _params, errorMessage = defaultErrorMessage }) => {
    if (typeof minValue === 'undefined' || invalids.includes(minValue)) return { valid: true };
    if (invalids.includes(value)) return { valid: true };
    const valueIsInvalid = compare(value, (number) => number < minValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };

export const maxValidator: (_params?: MinMaxValidatorParams, errorMessage?: string) => MargaritaFormValidator<number> =
  (_params = undefined, defaultErrorMessage = 'Value is too high!') =>
  ({ value, params: maxValue = _params, errorMessage = defaultErrorMessage }) => {
    if (typeof maxValue === 'undefined' || invalids.includes(maxValue)) return { valid: true };
    if (invalids.includes(value)) return { valid: true };
    const valueIsInvalid = compare(value, (number) => number > maxValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
