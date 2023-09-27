import { MargaritaFormValidator, MargaritaFormValidatorResult } from '../margarita-form-types';

const isCamelCase = (value: string) => /^[a-z][a-zA-Z0-9]*$/.test(value);
const isSnakeCase = (value: string) => /^[a-z][a-z0-9_]*$/.test(value);
const isKebabCase = (value: string) => /^[a-z][a-z0-9-]*$/.test(value);

type Case = 'camel' | 'snake' | 'kebab';

export const caseValidator: (errorMessage?: string) => MargaritaFormValidator<Case> =
  (defaultErrorMessage = 'Value does not match requirements!') =>
  ({ value, params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };

    const checkValidity = () => {
      if (typeof value !== 'string') return false;
      if (params === 'camel') return isCamelCase(value);
      if (params === 'snake') return isSnakeCase(value);
      if (params === 'kebab') return isKebabCase(value);
      throw new Error('Invalid case type. Case must be one of: camel, snake, kebab');
    };

    const valid = checkValidity();
    return { valid, error: errorMessage };
  };

export const controlNameCaseValidator: (errorMessage?: string, throwError?: boolean) => MargaritaFormValidator<Case> =
  (defaultErrorMessage = 'Name of the field does not match requirements!', throwError = true) =>
  ({ control, params, errorMessage = defaultErrorMessage, ...rest }) => {
    const validator = caseValidator(errorMessage);
    const result = validator({ ...rest, control, params, errorMessage, value: control.name }) as MargaritaFormValidatorResult;

    if (throwError && !result.valid) {
      const path = control.getPath().join('.');
      throw new Error(`Control (${path}) has invalid name! All control names must be ${params} case!`);
    }

    return result;
  };
