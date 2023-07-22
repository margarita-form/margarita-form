import type { MFF, MargaritaFormControl } from '@margarita-form/core';
import { useControlContext } from '../providers/control/control-context';

export const useGetControl = <VALUE = unknown, FIELD extends MFF<VALUE, FIELD> = MFF>(
  identifier: string | number
): MargaritaFormControl<VALUE, FIELD> | null => {
  const control = useControlContext();
  if (!control) return null;
  if (control.controls) return control.getControl<VALUE, FIELD>(identifier);
  return null;
};
