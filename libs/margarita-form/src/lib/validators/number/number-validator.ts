import { MargaritaFormValidator } from '../../margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    number: ReturnType<typeof numberValidator>;
    integer: ReturnType<typeof integerValidator>;
    float: ReturnType<typeof floatValidator>;
    positiveNumber: ReturnType<typeof positiveNumberValidator>;
    negativeNumber: ReturnType<typeof negativeNumberValidator>;
  }
}

type NumberValidatorParams = undefined | boolean;

export const numberValidator: (
  _params?: NumberValidatorParams,
  errorMessage?: string,
  _regex?: RegExp
) => MargaritaFormValidator<boolean> =
  (_params = true, defaultErrorMessage = 'Please enter a valid number!', _regex = /\d+/g) =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    const invalidValues: unknown[] = [null, undefined, ''];
    if (!params || invalidValues.includes(value)) return { valid: true };
    const regex = new RegExp(_regex);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };

export const integerValidator: (_params?: NumberValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> = (
  _params = true,
  defaultErrorMessage = 'Please enter a valid integer!'
) => numberValidator(_params, defaultErrorMessage, /^\d+$/g);

export const floatValidator: (_params?: NumberValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> = (
  _params = true,
  defaultErrorMessage = 'Please enter a valid float!'
) => numberValidator(_params, defaultErrorMessage, /^\d+\.\d+$/g);

export const positiveNumberValidator: (_params?: NumberValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> = (
  _params = true,
  defaultErrorMessage = 'Please enter a positive number!'
) => numberValidator(_params, defaultErrorMessage, /^\d+/g);

export const negativeNumberValidator: (_params?: NumberValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> = (
  _params = true,
  defaultErrorMessage = 'Please enter a negative number!'
) => numberValidator(_params, defaultErrorMessage, /^-\d+/g);
