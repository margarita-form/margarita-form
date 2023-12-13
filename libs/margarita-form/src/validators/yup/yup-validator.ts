import { MargaritaFormValidator } from '../../margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    yup: ReturnType<typeof yupValidator>;
  }
}

export interface YupLikeSchema {
  validate(value: any): Promise<unknown>;
  [key: string]: any;
}

export const yupValidator: (_params?: YupLikeSchema, errorMessage?: string) => MargaritaFormValidator<YupLikeSchema> =
  (_params = undefined, defaultErrorMessage = 'Value must match the schema!') =>
  async ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params) return { valid: true };
    try {
      const schema = params as YupLikeSchema;
      const result = await schema.validate(value);
      const valueIsInvalid = !result;
      const error = valueIsInvalid ? errorMessage : null;
      return { valid: !valueIsInvalid, error };
    } catch (error: any) {
      if (error.message) {
        return { valid: false, error: error.message, errorObject: error };
      }
      return { valid: false, error: errorMessage, errorObject: error };
    }
  };
