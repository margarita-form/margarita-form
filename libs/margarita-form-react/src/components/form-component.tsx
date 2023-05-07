import type { FormHTMLAttributes } from 'react';
import type { CommonRecord, MargaritaForm, MargaritaFormField, MargaritaFormRootField } from '@margarita-form/core';
import { useMargaritaForm } from '../hooks/use-margarita-form';
import { FormProvider } from '../providers/form/form-provider';

interface WithForm {
  form: MargaritaForm<any, any>;
}

type FormField = Partial<MargaritaFormField<FormField>> & MargaritaFormRootField<any> & CommonRecord;

interface WithField {
  field: FormField;
}

type WithFormOrSchema = WithForm | WithField;

type FormComponentProps = FormHTMLAttributes<HTMLFormElement> & WithFormOrSchema;

export const Form = (props: FormComponentProps) => {
  if ('field' in props) {
    return <CreateForm {...props} />;
  }

  if ('form' in props) {
    return <FormElement {...props} />;
  }

  throw 'No form or field provided as prop for the <Form>';
};

type CreateFormProps = FormHTMLAttributes<HTMLFormElement> & WithField;

export const CreateForm = ({ field, ...rest }: CreateFormProps) => {
  const form = useMargaritaForm<unknown, FormField>(field);
  return <FormElement form={form} {...rest} />;
};

type FormElementProps = FormHTMLAttributes<HTMLFormElement> & WithForm;

export const FormElement = (props: FormElementProps) => {
  const { form, children, ...attr } = props;
  return (
    <FormProvider form={form}>
      <form ref={form.setRef} {...attr}>
        {children}
      </form>
    </FormProvider>
  );
};
