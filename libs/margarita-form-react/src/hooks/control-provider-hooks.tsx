import type { MargaritaForm, MargaritaFormControl } from '@margarita-form/core';
import { createContext, ReactNode, useContext } from 'react';

type ControlContextType = MargaritaForm | MargaritaFormControl | null;

interface ProvideControlProps {
  children: ReactNode;
  control: ControlContextType;
}

export const ControlContext = createContext<ControlContextType>(null);

export const ProvideControl = ({ control, children }: ProvideControlProps) => {
  return (
    <ControlContext.Provider value={control}>
      {children}
    </ControlContext.Provider>
  );
};

export const useControlContext = () => {
  const control = useContext(ControlContext);
  return control;
};
