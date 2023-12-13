import { MargaritaFormValidator } from '../../margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    date: ReturnType<typeof dateValidator>;
  }
}

type DateValidatorParams = undefined | boolean;

export const dateValidator: (params?: DateValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> =
  (_params = true, defaultErrorMessage = 'Please enter a valid date!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    try {
      const date = value instanceof Date ? value : new Date(String(value));
      const valid = Boolean(date.getTime());
      const error = !valid ? errorMessage : null;
      return { valid, error };
    } catch (error) {
      return { valid: false, error: errorMessage };
    }
  };
