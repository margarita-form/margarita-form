import { MargaritaFormValidatorFunction } from '../margarita-form-types';

export const uniqueValidator: (
  errorMessage?: string
) => MargaritaFormValidatorFunction<boolean | string[]> =
  (errorMessage = 'Please enter an unique value!') =>
  ({ value, control, params }) => {
    const parentControls = control.parent.controls;

    if (!params || !parentControls) return { valid: true };

    const siblings = parentControls.filter((sibling) => {
      const { key, name } = sibling;
      if (key === control.key) return false;
      const identifiers = [key, name];
      if (Array.isArray(params)) {
        return params.some((identifier) => !identifiers.includes(identifier));
      }
      return params;
    });

    const valueIsInvalid = siblings.some(
      ({ value: siblingValue }) =>
        JSON.stringify(siblingValue) === JSON.stringify(value)
    );

    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };
