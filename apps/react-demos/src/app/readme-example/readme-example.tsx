import { useMargaritaForm, MargaritaFormField } from '@margarita-form/react';

// Create value and custom field types
interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField {
  type: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

// Create form component
export function CustomForm() {
  // Initialize form
  const form = useMargaritaForm<RootField>({
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

  return (
    <div className="form-wrapper">
      {/* Render the current value */}
      <h2>Current value</h2>
      <code>{JSON.stringify(form.value)}</code>

      {/* Render the form */}
      <h2>Form</h2>
      <form ref={form.setRef}>
        {/* Map controls and connect to inputs */}
        {form.controls.map((control) => {
          const uid = control.name + '-' + control.key;

          // Use switch to render different types of fields
          switch (control.field.type) {
            case 'textarea':
              return (
                <div className="field-wrapper" key={uid}>
                  <label htmlFor={uid}>{control.field.title}</label>
                  <textarea id={uid} name={uid} ref={control.setRef} />
                </div>
              );

            default:
              return (
                <div className="field-wrapper" key={uid}>
                  <label htmlFor={uid}>{control.field.title}</label>
                  <input id={uid} name={uid} type={control.field.type} ref={control.setRef} />
                </div>
              );
          }
        })}

        {/* Submit the form */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
