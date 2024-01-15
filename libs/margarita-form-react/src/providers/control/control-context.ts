import type { MargaritaForm, MargaritaFormControl } from '@margarita-form/core/light';
import { createContext, useContext } from 'react';

export type ControlContextType = MargaritaForm<any> | MargaritaFormControl<any>;

export const ReactControlContext = createContext<ControlContextType | null>(null);

export const useControlContext = <CONTROL_TYPE extends ControlContextType>() => {
  const control = useContext(ReactControlContext);
  return control as CONTROL_TYPE;
};
