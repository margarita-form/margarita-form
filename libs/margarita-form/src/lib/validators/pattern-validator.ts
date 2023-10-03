import { MargaritaFormValidator } from '../margarita-form-types';

const DEFAULT_TIMEOUT = 2000; // 2 seconds

const validateRegex = (regex: RegExp, value: string, timeout: number = DEFAULT_TIMEOUT): boolean => {
  const start = Date.now();
  let match = false;
  while (!match && Date.now() - start < timeout) match = regex.test(value);
  if (!match) throw new Error('Regex is too complex and may cause ReDoS!');
  return true;
};

export const patternValidator: (errorMessage?: string) => MargaritaFormValidator<string | RegExp> =
  (defaultErrorMessage = 'Value does not match required pattern!') =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = typeof params === 'string' ? new RegExp(params) : params;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const valueIsInvalid = !validateRegex(regex, stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
