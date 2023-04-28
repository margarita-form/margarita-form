import { combineLatest, map } from 'rxjs';
import { MargaritaFormValidator } from '../margarita-form-types';

export const sameAsValidator: (errorMessage?: string) => MargaritaFormValidator<boolean | string[]> =
  (errorMessage = 'Please enter same value!') =>
  ({ value, control, params }) => {
    const parentControls = control.parent.controls;

    if (!params || !parentControls || !value) return { valid: true };

    const siblings = parentControls.filter((sibling) => {
      const { key, name } = sibling;
      if (key === control.key) return false;
      const identifiers = [key, name];
      if (Array.isArray(params)) {
        return params.some((identifier) => !identifiers.includes(identifier));
      }
      return params;
    });

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
  };
