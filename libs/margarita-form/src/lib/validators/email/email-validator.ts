import { MargaritaFormValidator } from '../../margarita-form-types';

type EmailValidatorParams = undefined | boolean;

export const emailValidator: (_params?: EmailValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> =
  (_params = true, defaultErrorMessage = 'Value must be a valid email address!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/.+@.+\..+/g);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
