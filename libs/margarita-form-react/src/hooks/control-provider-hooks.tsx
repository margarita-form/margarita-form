import { createContext, ReactNode, useContext } from 'react';
import { MargaritaFormControlTypes } from '@margarita-form/core';

interface ProvideControlProps {
  children: ReactNode;
  control: MargaritaFormControlTypes;
}

export const ControlContext = createContext<MargaritaFormControlTypes | null>(
  null
);

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
