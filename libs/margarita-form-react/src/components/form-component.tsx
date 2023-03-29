import { MargaritaFormField, MargaritaFormOptions } from '@margarita-form/core';
import { FormHTMLAttributes } from 'react';
import { useMargaritaForm } from '../hooks/create-margarita-form-hooks';
import { ProvideForm } from '../hooks/form-provider-hooks';

interface FormComponentProps<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> extends FormHTMLAttributes<HTMLFormElement> {
  options: MargaritaFormOptions<T, F>;
}

export const Form = ({ options, children, ...rest }: FormComponentProps) => {
  const form = useMargaritaForm(options);
  return (
    <ProvideForm form={form}>
      <form ref={form.setRef} {...rest}>
        {children}
      </form>
    </ProvideForm>
  );
};
