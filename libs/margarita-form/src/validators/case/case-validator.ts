import { MargaritaFormValidator, MargaritaFormValidatorResult } from '../../typings/margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    case: ReturnType<typeof caseValidator>;
    controlNameCase: ReturnType<typeof controlNameCaseValidator>;
  }
}

const isCamelCase = (value: string) => /^[a-z][a-zA-Z0-9]*$/.test(value);
const isSnakeCase = (value: string) => /^[a-z][a-z0-9_]*$/.test(value);
const isKebabCase = (value: string) => /^[a-z][a-z0-9-]*$/.test(value);

type Case = 'camel' | 'snake' | 'kebab';

export const caseValidator: (params?: Case, errorMessage?: string) => MargaritaFormValidator<Case> =
  (_params = undefined, defaultErrorMessage = 'Value does not match requirements!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };

    const checkValidity = () => {
      if (typeof value !== 'string') return false;
      if (params === 'camel') return isCamelCase(value);
      if (params === 'snake') return isSnakeCase(value);
      if (params === 'kebab') return isKebabCase(value);
      throw 'Invalid case type. Case must be one of: camel, snake, kebab';
    };

    const valid = checkValidity();
    return { valid, error: errorMessage };
  };

export const controlNameCaseValidator: (errorMessage?: string, throwError?: boolean) => MargaritaFormValidator<Case> =
  (defaultErrorMessage = 'Name of the field does not match requirements!', throwError = true) =>
  ({ control, params, errorMessage = defaultErrorMessage, ...rest }) => {
    const validator = caseValidator(params, errorMessage);
    const result = validator({ ...rest, control, params, errorMessage, value: control.name }) as MargaritaFormValidatorResult;

    if (throwError && !result.valid) {
      const path = control.getPath().join('.');
      throw new Error(`Control (${path}) has invalid name! All control names must be ${params} case!`);
    }

    return result;
  };
