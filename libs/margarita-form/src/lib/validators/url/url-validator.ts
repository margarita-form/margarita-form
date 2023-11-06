import { MargaritaFormValidator } from '../../margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    url: ReturnType<typeof urlValidator>;
  }
}

type UrlValidatorParams = boolean;

export const urlValidator: (_params?: UrlValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> =
  (_params = true, defaultErrorMessage = 'Please enter a valid url!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/https?:\/\/.+\..+/g);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
