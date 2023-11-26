import type { ReactNode } from 'react';
import { ReactControlContext, ControlContextType } from './control-context';

interface ControlProviderProps {
  children: ReactNode;
  control: ControlContextType;
}

export const ControlProvider = ({ control, children }: ControlProviderProps) => {
  return <ReactControlContext.Provider value={control}>{children}</ReactControlContext.Provider>;
};
