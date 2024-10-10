import { combineLatest, map } from 'rxjs';
import { MargaritaFormValidator } from '../../typings/margarita-form-types';
import { valueIsDefined } from '../../helpers/check-value';

declare module '../../typings/resolver-types' {
  export interface Validators {
    sameAs: ReturnType<typeof sameAsValidator>;
  }
}

type SameAsValidatorParams = undefined | string | string[];

export const sameAsValidator: (_params?: SameAsValidatorParams, errorMessage?: string) => MargaritaFormValidator<string | string[]> =
  (_params: SameAsValidatorParams = undefined, defaultErrorMessage = 'Please enter same value!') =>
  ({ value, control, params = _params, errorMessage = defaultErrorMessage }) => {
    try {
      const parentControls = control.parent.controls;

      if (!params || !parentControls || !valueIsDefined(value)) return { valid: true };

      const siblings = parentControls.filter((sibling) => {
        const { key, name } = sibling;
        if (key === control.key) return false;
        const identifiers = [key, name];
        if (Array.isArray(params)) {
          return params.some((identifier) => identifiers.includes(identifier));
        }
        return params;
      });

      if (!siblings.length) {
        const path = control.getPath();
        console.warn(`No siblings (${params}) found for ${path.join('.')}! Cannot run sameAsValidator.`);
        return { valid: true };
      }

      const changes = siblings.map((sibling) => sibling.valueChanges.pipe(map(() => sibling)));

      return combineLatest(changes).pipe(
        map((_siblings) => {
          const valid = _siblings.some(({ value: siblingValue }) => {
            return JSON.stringify(siblingValue) === JSON.stringify(value);
          });

          const error = !valid ? errorMessage : null;
          return { valid, error };
        })
      );
    } catch (error) {
      return { valid: false, error: errorMessage, errorObject: error };
    }
  };
