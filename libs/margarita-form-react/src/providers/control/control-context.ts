import type { MargaritaForm, MargaritaFormControl } from '@margarita-form/core';
import { createContext, useContext } from 'react';

export type ControlContextType = MargaritaForm<any> | MargaritaFormControl<any>;

export const ControlContext = createContext<ControlContextType | null>(null);

export const useControlContext = <CONTROL_TYPE extends ControlContextType>() => {
  const control = useContext(ControlContext);
  return control as CONTROL_TYPE;
};
