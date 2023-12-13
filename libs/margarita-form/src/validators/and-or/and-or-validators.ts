import { map } from 'rxjs';
import { MargaritaFormValidator, MargaritaFormValidatorResult } from '../../typings/margarita-form-types';
import { getResolverOutputMapObservable } from '../../helpers/resolve-function-outputs';

declare module '../../typings/resolver-types' {
  export interface Validators {
    and: ReturnType<typeof andValidator>;
    or: ReturnType<typeof orValidator>;
  }
}

type AndOrValidatorParams = undefined | Record<string, any>;

const _validatorBase: (
  params: AndOrValidatorParams,
  requireAll: boolean,
  defaultErrorMessage: string
) => MargaritaFormValidator<Record<string, any>> =
  (_params, requireAll, defaultErrorMessage) =>
  ({ value, control, params = _params, errorMessage = defaultErrorMessage }) => {
    if (!params || !value) return { valid: true };
    const validators = control.validators;

    const validations = getResolverOutputMapObservable(params, control, validators);

    const fnName: 'every' | 'some' = requireAll ? 'every' : 'some';

    const callback = (validations: Record<string, MargaritaFormValidatorResult>) => {
      const valid = Object.values(validations)[fnName]((validation) => validation.valid);
      const error = !valid ? errorMessage : null;
      return { valid: !valid, error };
    };

    if (validations instanceof Promise) {
      return validations.then(callback);
    }

    return validations.pipe(map(callback));
  };

export const andValidator = (errorMessage = 'All requirements need to be valid!') => _validatorBase(undefined, true, errorMessage);

export const orValidator = (errorMessage = 'At least one requirement needs to be valid!') => _validatorBase(undefined, false, errorMessage);
