import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MargaritaFormField, MargaritaFormModule, MargaritaFormService } from '@margarita-form/angular';

// Create value and custom field types
interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<{ fields: MyFormField }> {
  type: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

// Create form component
@Component({
    selector: 'app-readme-example',
    imports: [CommonModule, MargaritaFormModule],
    styleUrl: './readme-example.component.scss',
    templateUrl: './readme-example.component.html'
})
export class ReadmeExampleComponent {
  private formService = inject(MargaritaFormService);

  // Initialize form
  public form = this.formService.createForm<RootField>({
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
        alert(JSON.stringify(value, null, 2));
      },
      // This optional function is called when the form is invalid
      invalid: async ({ control, value }) => {
        const { allErrors } = control.state;
        console.log('Form is not valid!', { value, allErrors });
      },
    },
    config: {
      handleSuccesfullSubmit: 'reset', // Change what happens when form is successfully submitted
    },
  });
}
