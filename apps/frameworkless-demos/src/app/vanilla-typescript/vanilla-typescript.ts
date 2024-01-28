import { MargaritaFormControl, MargaritaFormField, createMargaritaForm } from '@margarita-form/core';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField {
  type: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

type MyFormControl = MargaritaFormControl<MyFormField>;

const form = createMargaritaForm<RootField>({
  name: 'my-form', // Name for each form should be unique
  fields: [
    {
      name: 'name',
      title: 'Full name',
      type: 'text',
      validation: { required: true },
      attributes: { placeholder: 'John Doe' }, // Attributes are passed to the input
    },
    {
      name: 'email',
      title: 'Email',
      type: 'email',
      validation: { required: true },
      attributes: { placeholder: 'john.doe@email.com' },
    },
    {
      name: 'message',
      title: 'Message',
      type: 'textarea',
      validation: { required: true },
      attributes: { placeholder: 'Lorem ipsum' }, // Attributes are passed to the input
    },
  ],
  handleSubmit: {
    // This required function is called when the form is valid
    valid: async ({ value }) => {
      console.log('Valid submit', { value });
      alert(`Form is valid!\n${JSON.stringify(value, null, 2)}`);
    },
    // This optional function is called when the form is invalid
    invalid: async ({ control, value }) => {
      const { allErrors } = control.state;
      alert(`Form is not valid!\n${JSON.stringify(allErrors, null, 2)}`);
      console.log('Form is not valid!', { value, allErrors });
    },
  },
  config: {
    handleSuccesfullSubmit: 'reset', // Change what happens when form is successfully submitted
  },
  onValueChanges: ({ value }) => {
    const currentValueEl = document.querySelector<HTMLElement>('#current-value');
    if (!currentValueEl) throw new Error('Element with id "current-value" was not found');
    currentValueEl.innerText = JSON.stringify(value);
  },
});

const formEl = document.querySelector('form');
if (!formEl) throw new Error('Element with tag "form" was not found');
form.setRef(formEl);

const getInputEl = (control: MyFormControl) => {
  switch (control.field.type) {
    case 'textarea':
      return document.createElement('textarea');
    default:
      return document.createElement('input');
  }
};

const formFieldsContainerEl = formEl.querySelector('.form-fields-container');
if (!formFieldsContainerEl) throw new Error('Element with class "form-fields-container" was not found');

form.controls.forEach((control) => {
  const fieldEl = document.createElement('div');
  fieldEl.classList.add('field-wrapper');

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', control.uid);
  labelEl.innerText = `${control.field.title}:`;

  const inputEl = getInputEl(control);
  inputEl.setAttribute('id', control.uid);
  inputEl.setAttribute('name', control.name);
  inputEl.setAttribute('type', control.field.type);

  formFieldsContainerEl.appendChild(fieldEl);
  fieldEl.appendChild(labelEl);
  fieldEl.appendChild(inputEl);
  control.setRef(inputEl);
});
