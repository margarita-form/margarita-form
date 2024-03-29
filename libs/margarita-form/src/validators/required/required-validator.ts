import { MargaritaFormValidator } from '../../index';

declare module '../../typings/resolver-types' {
  export interface Validators {
    required: ReturnType<typeof requiredValidator>;
  }
}

type RequiredValidatorParams = boolean;

export const requiredValidator: (_params?: RequiredValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> =
  (_params = true, defaultErrorMessage = 'This field is required!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params) return { valid: true };
    const invalidValues: unknown[] = [null, undefined, NaN, Infinity, ''];
    let valueIsInvalid = invalidValues.includes(value);
    if (!valueIsInvalid || !value) {
      if (typeof value === 'string') valueIsInvalid = value.trim().length < 1;
      if (Array.isArray(value)) valueIsInvalid = value.length < 1;
      if (typeof value === 'object') Object.keys(value).length < 1;
    }
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
