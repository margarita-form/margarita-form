import type { MFF, MargaritaFormControl } from '@margarita-form/core';
import { useControlContext } from '../providers/control/control-context';

export const useGetOrAddControl = <VALUE = unknown, FIELD extends MFF<VALUE, FIELD> = MFF>(
  field: FIELD
): MargaritaFormControl<VALUE, FIELD> | null => {
  const control = useControlContext();
  if (!control) return null;
  if (control.controls) return control.getOrAddControl<VALUE, FIELD>(field);
  return null;
};
