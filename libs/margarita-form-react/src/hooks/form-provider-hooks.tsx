import { createContext, ReactNode, useContext } from 'react';
import { MargaritaForm } from '@margarita-form/core';
import { ProvideControl } from './control-provider-hooks';

interface ProvideFormProps {
  children: ReactNode;
  form: MargaritaForm;
}

export const FormContext = createContext<MargaritaForm | null>(null);

export const ProvideForm = ({ form, children }: ProvideFormProps) => {
  return (
    <FormContext.Provider value={form}>
      <ProvideControl control={form}>{children}</ProvideControl>
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const form = useContext(FormContext);
  return form;
};
