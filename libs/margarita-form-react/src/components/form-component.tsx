import {
  MargaritaForm,
  MargaritaFormField,
  MargaritaFormOptions,
} from '@margarita-form/core';
import { FormHTMLAttributes } from 'react';
import { useMargaritaForm } from '../hooks/create-margarita-form-hooks';
import { ProvideForm } from '../hooks/form-provider-hooks';

interface FormComponentProps<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> extends FormHTMLAttributes<HTMLFormElement> {
  form?: MargaritaForm<T, F>;
  options?: MargaritaFormOptions<T, F>;
}

export const Form = ({
  form,
  options,
  children,
  ...rest
}: FormComponentProps) => {
  if (!form && !options)
    throw 'No form or options provided as props for the Form';
  const _form = useMargaritaForm(form || options || { fields: [] });
  return (
    <ProvideForm form={_form}>
      <form ref={_form.setRef} {...rest}>
        {children}
      </form>
    </ProvideForm>
  );
};
