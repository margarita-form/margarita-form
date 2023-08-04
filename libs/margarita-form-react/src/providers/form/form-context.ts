import type { MargaritaForm } from '@margarita-form/core';
import { createContext, useContext } from 'react';

export const FormContext = createContext<MargaritaForm<any> | null>(null);

export const useFormContext = <FORM_TYPE extends MargaritaForm>() => {
  const form = useContext(FormContext);
  return form as FORM_TYPE;
};
