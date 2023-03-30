import { createContext, ReactNode, useContext } from 'react';
import { MargaritaFormControl } from '@margarita-form/core';

interface ProvideControlProps {
  children: ReactNode;
  control: MargaritaFormControl;
}

export const ControlContext = createContext<MargaritaFormControl | null>(null);

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
