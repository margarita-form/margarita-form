import type { MFC, MFF } from '@margarita-form/core/light';
import { useControlContext } from '../providers/control/control-context';

export const useGetControl = <FIELD extends MFF>(identifier: string | number): MFC<FIELD> | null => {
  const control = useControlContext();
  if (!control) return null;
  if (control.controls) return control.getControl(identifier) as MFC<FIELD>;
  return null;
};
