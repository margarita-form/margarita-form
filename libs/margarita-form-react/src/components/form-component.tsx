import { MFF, MargaritaForm, MargaritaFormRootField } from '@margarita-form/core';
import { FormHTMLAttributes } from 'react';
import { useMargaritaForm } from '../hooks/create-margarita-form-hooks';
import { ProvideForm } from '../hooks/form-provider-hooks';

interface WithForm {
  form: MargaritaForm<any, any>;
}

interface WithSchema {
  schema: MargaritaFormRootField<any>;
}

type WithFormOrSchema = WithForm | WithSchema;

type FormComponentProps = FormHTMLAttributes<HTMLFormElement> & WithFormOrSchema;

export const Form = (props: FormComponentProps) => {
  if ('schema' in props) {
    return <CreateForm {...props} />;
  }

  if ('form' in props) {
    const { form, children, ...attr } = props;
    return (
      <ProvideForm form={form}>
        <form ref={form.setRef} {...attr}>
          {children}
        </form>
      </ProvideForm>
    );
  }

  throw 'No form or options provided as props for the Form';
};

interface CreateFormProps extends FormHTMLAttributes<HTMLFormElement> {
  schema: MFF;
}

const CreateForm = ({ schema, children, ...attr }: CreateFormProps) => {
  const form = useMargaritaForm<any, any>(schema);

  return (
    <ProvideForm form={form}>
      <form ref={form.setRef} {...attr}>
        {children}
      </form>
    </ProvideForm>
  );
};
