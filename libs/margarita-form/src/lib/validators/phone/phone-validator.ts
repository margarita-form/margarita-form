import { MargaritaFormValidator } from '../../margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    tel: ReturnType<typeof phoneValidator>;
    phone: ReturnType<typeof phoneValidator>;
  }
}

type PhoneValidatorParams = boolean | undefined;

export const phoneValidator: (_params?: PhoneValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> =
  (_params = true, defaultErrorMessage = 'Value must be a valid phone number!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/\+?[0-9\s]{3,30}/gi);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
