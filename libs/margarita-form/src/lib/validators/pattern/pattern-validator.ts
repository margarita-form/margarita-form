import { MargaritaFormValidator } from '../../margarita-form-types';

const DEFAULT_TIMEOUT = 2000; // 2 seconds

const validateRegex = (regex: RegExp, value: string, timeout: number = DEFAULT_TIMEOUT): boolean => {
  const start = Date.now();
  let match = null;
  while (match == null && Date.now() - start < timeout) match = regex.test(value);
  if (match === null) throw new Error('Regex is too complex and may cause ReDoS!');
  return match;
};

type PatternValidatorParams = string | RegExp | undefined;

export const patternValidator: (_params?: PatternValidatorParams, errorMessage?: string) => MargaritaFormValidator<string | RegExp> =
  (_params = undefined, defaultErrorMessage = 'Value does not match required pattern!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(params);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const valueIsInvalid = !validateRegex(regex, stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
