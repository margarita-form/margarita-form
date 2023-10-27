import { MargaritaFormValidator } from '../margarita-form-types';

export const numberValidator: (errorMessage?: string, _regex?: RegExp) => MargaritaFormValidator<boolean> =
  (defaultErrorMessage = 'Please enter a valid number!', _regex = /\d+/g) =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    const invalidValues: unknown[] = [null, undefined, ''];
    if (!params || invalidValues.includes(value)) return { valid: true };
    const regex = new RegExp(_regex);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };

export const integerValidator: (errorMessage?: string) => MargaritaFormValidator<boolean> = (
  defaultErrorMessage = 'Please enter a valid integer!'
) => numberValidator(defaultErrorMessage, /^\d+$/g);

export const floatValidator: (errorMessage?: string) => MargaritaFormValidator<boolean> = (
  defaultErrorMessage = 'Please enter a valid float!'
) => numberValidator(defaultErrorMessage, /^\d+\.\d+$/g);

export const positiveNumberValidator: (errorMessage?: string) => MargaritaFormValidator<boolean> = (
  defaultErrorMessage = 'Please enter a positive number!'
) => numberValidator(defaultErrorMessage, /^\d+/g);

export const negativeNumberValidator: (errorMessage?: string) => MargaritaFormValidator<boolean> = (
  defaultErrorMessage = 'Please enter a negative number!'
) => numberValidator(defaultErrorMessage, /^-\d+/g);
