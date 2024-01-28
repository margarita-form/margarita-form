import { MargaritaFormField, createMargaritaForm } from '@margarita-form/core';
import { HTMLTemplateExtension } from '@margarita-form/core/extensions/html-template-extension';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField {
  type: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'group' | 'array';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

const inputTemplate = `<div class="field-wrapper">
<label for="{{uid}}">{{title}}</label>
<input type="{{type}}" id="{{uid}}" name="{{name}}" mf-set-ref />
</div>`;

const textareaTemplate = `<div class="field-wrapper">
<label for="{{uid}}">{{title}}</label>
<textarea id="{{uid}}" name="{{name}}" mf-set-ref></textarea>
</div>`;

const groupTemplate = `<div class="field-wrapper" >
<p>{{title}}</p>
<div class="grouped-fields" mf-controls-container mf-set-ref></div>
</div>`;

const arrayTemplate = `<div class="field-wrapper" >
<p>{{title}}</p>
<div class="grouped-fields" mf-controls-container mf-set-ref></div>
<button type="button" mf-listen="click,appendControl" >Add item</button>
</div>`;

// type MyFormControl = MargaritaFormControl<MyFormField>;

createMargaritaForm<RootField>({
  name: 'my-form', // Name for each form should be unique
  extensions: [HTMLTemplateExtension],
  resolvers: {
    appendControl: ({ control }) => {
      control.appendControl();
    },
  },
  fields: [
    {
      name: 'name',
      title: 'Full name',
      type: 'text',
      validation: { required: true },
      attributes: { placeholder: 'John Doe' }, // Attributes are passed to the input
      htmlTemplate: inputTemplate,
    },
    {
      name: 'email',
      title: 'Email',
      type: 'email',
      validation: { required: true },
      attributes: { placeholder: 'john.doe@email.com' },
      htmlTemplate: inputTemplate,
    },
    {
      name: 'message',
      title: 'Message',
      type: 'textarea',
      validation: { required: true },
      attributes: { placeholder: 'Lorem ipsum' }, // Attributes are passed to the input
      htmlTemplate: textareaTemplate,
    },
    {
      name: 'group',
      title: 'Group',
      type: 'group',
      htmlTemplate: groupTemplate,
      fields: [
        {
          name: 'lorem',
          title: 'Lorem',
          type: 'text',
          htmlTemplate: inputTemplate,
        },
      ],
    },
    {
      name: 'array',
      title: 'Array',
      type: 'array',
      grouping: 'array',
      htmlTemplate: arrayTemplate,
      fields: [
        {
          name: 'lorem',
          title: 'Lorem',
          type: 'text',
          htmlTemplate: inputTemplate,
        },
      ],
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
