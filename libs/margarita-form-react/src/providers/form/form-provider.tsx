import type { MargaritaForm } from '@margarita-form/core';
import type { ReactNode } from 'react';
import { FormContext } from './form-context';
import { ControlProvider } from '../control/control-provider';

interface FormProviderProps {
  children: ReactNode;
  form: MargaritaForm<any, any>;
}

export const FormProvider = ({ form, children }: FormProviderProps) => {
  return (
    <FormContext.Provider value={form}>
      <ControlProvider control={form}>{children}</ControlProvider>
    </FormContext.Provider>
  );
};
