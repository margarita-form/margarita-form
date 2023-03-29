import { MargaritaFormControlTypes } from '@margarita-form/core';
import { useControlContext } from './control-provider-hooks';

export const useControl = <T = MargaritaFormControlTypes,>(
  identifier: string | number
): T | null => {
  const control = useControlContext();
  if (!control) return null;
  if (control.controls) return control.getControl(identifier);
  return null;
};
