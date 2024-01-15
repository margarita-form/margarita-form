import { createMargaritaForm, MargaritaFormField } from '@margarita-form/core';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<{ value: MyFormValue; fields: MyFormField }> {
  type: 'text' | 'textarea';
  title: string;
}

type RootField = MargaritaFormField<{ fields: MyFormField }>;

export const form = createMargaritaForm<RootField>({
  name: 'my-form',
  fields: [{ name: 'myControl', type: 'text', title: 'My Control', validation: { required: true } }],
  handleSubmit: {
    valid: async ({ control: form, value }) => {
      console.log('Valid submit', { form, value });
    },
  },
});
