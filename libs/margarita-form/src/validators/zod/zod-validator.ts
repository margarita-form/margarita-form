import { MargaritaFormValidator } from '../../typings/margarita-form-types';

declare module '../../typings/resolver-types' {
  export interface Validators {
    zod: ReturnType<typeof zodValidator>;
  }
}

export interface ZodLikeSchema {
  parseAsync(value: any): Promise<unknown>;
  [key: string]: any;
}

export const zodValidator: (_params?: ZodLikeSchema, errorMessage?: string) => MargaritaFormValidator<ZodLikeSchema> =
  (_params?: ZodLikeSchema, defaultErrorMessage = 'Value must match the schema!') =>
  async ({ value, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params) return { valid: true };
    try {
      const schema = params as ZodLikeSchema;
      const result = await schema.parseAsync(value);
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
