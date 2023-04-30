import { MFF, MargaritaFormControl } from '@margarita-form/core';
import { useControlContext } from './control-provider-hooks';

export const useControl = <VALUE = unknown, FIELD extends MFF<FIELD> = MFF>(
  identifier: string | number
): MargaritaFormControl<VALUE, FIELD> | null => {
  const control = useControlContext();
  if (!control) return null;
  if (control.controls) return control.getControl<VALUE, FIELD>(identifier);
  return null;
};
