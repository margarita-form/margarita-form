import { MargaritaFormValidator } from '../margarita-form-types';

export interface YupLikeSchema {
  validate(value: any): Promise<unknown>;
  [key: string]: any;
}

export const yupValidator: (errorMessage?: string) => MargaritaFormValidator<YupLikeSchema> =
  (defaultErrorMessage = 'Value must match the schema!') =>
  async ({ value, params, errorMessage = defaultErrorMessage }) => {
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
