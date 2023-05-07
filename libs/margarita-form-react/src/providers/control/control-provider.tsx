import type { ReactNode } from 'react';
import { ControlContext, ControlContextType } from './control-context';

interface ControlProviderProps {
  children: ReactNode;
  control: ControlContextType;
}

export const ControlProvider = ({ control, children }: ControlProviderProps) => {
  return <ControlContext.Provider value={control}>{children}</ControlContext.Provider>;
};
