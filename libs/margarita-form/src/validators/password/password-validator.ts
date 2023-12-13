import { MargaritaFormValidator } from '../../typings/margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    password: ReturnType<typeof passwordValidator>;
  }
}

type PasswordLengths = number | 'long' | 'medium' | 'regular' | 'short';
type PasswordValidatorParams = PasswordLengths | undefined;

const getPasswordLength = (length: PasswordLengths) => {
  if (typeof length === 'number') {
    return length;
  }
  switch (length) {
    case 'long':
      return 16;
    case 'medium':
      return 12;
    case 'short':
      return 4;
    default:
      return 8;
  }
};

export const passwordValidator: (_params?: PasswordValidatorParams, errorMessage?: string) => MargaritaFormValidator<PasswordLengths> =
  (_params = 'regular', defaultErrorMessage = 'Password is not strong enough!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/((?=.*[a-z\d])(?=.*[A-Z\d])(?=.*[\W]).{2,64})/);
    const stringValue = typeof value === 'string' ? value : String(value);
    const minLength = getPasswordLength(params);
    const valueIsInvalid = !regex.test(stringValue) || minLength > stringValue.length;
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
