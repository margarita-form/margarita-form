import { MargaritaFormValidator } from '../../typings/margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    typeof: ReturnType<typeof typeofValidator>;
  }
}

type Types =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'null'
  | 'object'
  | 'function'
  | 'array'
  | 'map'
  | 'date';

type TypeofValidatorParams = undefined | Types | Types[];

export const typeofValidator: (_params?: TypeofValidatorParams, errorMessage?: string) => MargaritaFormValidator<Types | Types[]> =
  (_params = undefined, defaultErrorMessage = 'Please enter a valid value!') =>
  ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    const invalidValues: unknown[] = [null, undefined, ''];
    if (!params || invalidValues.includes(value)) return { valid: true };
    const types = Array.isArray(params) ? params : [params];

    const valueIsValid = types.some((type) => {
      if (type === 'array') {
        return Array.isArray(value);
      } else if (type === 'map') {
        const isObject = typeof value === 'object' || value instanceof Map;
        const isArray = Array.isArray(value);
        return isObject && !isArray;
      } else if (type === 'date') {
        return value instanceof Date && !isNaN(value.getTime());
      } else if (type === 'null') {
        return value === null;
      } else {
        return typeof value === type;
      }
    });
    const error = valueIsValid ? null : errorMessage;
    return { valid: valueIsValid, error };
  };
