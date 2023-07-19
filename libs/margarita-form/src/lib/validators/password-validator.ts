import { MargaritaFormValidator } from '../margarita-form-types';

type PasswordLengths = 'long' | 'medium' | 'regular' | 'short';

const getPasswordLength = (length: PasswordLengths) => {
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

export const passwordValidator: (errorMessage?: string) => MargaritaFormValidator<PasswordLengths> =
  (defaultErrorMessage = 'Password is not strong enough!') =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/((?=.*[a-z\d])(?=.*[A-Z\d])(?=.*[\W]).{2,64})/);
    const stringValue = typeof value === 'string' ? value : String(value);
    const minLength = getPasswordLength(params);
    const valueIsInvalid = !regex.test(stringValue) || minLength > stringValue.length;
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
