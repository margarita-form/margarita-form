import { MFC, MargaritaFormControl } from '@margarita-form/core';
import { useControlContext } from './control-provider-hooks';

export const useControl = <CONTROL extends MargaritaFormControl = MFC>(identifier: string | number): CONTROL | null => {
  const control = useControlContext();
  if (!control) return null;
  if (control.controls) return control.getControl(identifier);
  return null;
};
