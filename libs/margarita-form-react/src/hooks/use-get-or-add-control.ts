import type { MFC, MFF } from '@margarita-form/core';
import { useControlContext } from '../providers/control/control-context';

export const useGetOrAddControl = <FIELD extends MFF>(field: FIELD): MFC<FIELD> | null => {
  const control = useControlContext();
  if (!control) return null;
  if (control.controls) return control.getOrAddControl<FIELD>(field);
  return null;
};
