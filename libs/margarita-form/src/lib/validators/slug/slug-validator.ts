import { MargaritaFormValidator } from '../../margarita-form-types';

type SlugValidatorParams = boolean;

export const slugValidator: (_params?: SlugValidatorParams, errorMessage?: string) => MargaritaFormValidator<boolean> =
  (_params = true, defaultErrorMessage = 'Value must be a valid slug!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
