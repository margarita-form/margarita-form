import { useMargaritaForm, MargaritaFormField } from '@margarita-form/react';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<{ value: MyFormValue; fields: MyFormField }> {
  type: 'text' | 'textarea';
  title: string;
}

type RootField = MargaritaFormField<{ fields: MyFormField }>;

export function App() {
  const form = useMargaritaForm<RootField>({
    name: 'my-form',
    fields: [
      {
        name: 'name',
        title: 'Full name',
        type: 'text',
        validation: { required: true },
        attributes: { placeholder: 'John Doe' },
      },
      {
        name: 'message',
        title: 'Message',
        type: 'textarea',
        validation: { required: true },
        attributes: { placeholder: 'Lorem ipsum' },
      },
    ],
    handleSubmit: {
      valid: async ({ control: form, value }) => {
        console.log('Valid submit', { form, value });
      },
      invalid: async ({ control: form, value }) => {
        console.log('Invalid submit', { form, value });
      },
    },
    config: {
      handleSuccesfullSubmit: 'reset', // Change what happens when form is successfully submitted
    },
  });

  return (
    <form ref={form.setRef}>
      {/* Very basic styling */}
      <style>{`
      form {
        max-width: 500px;
        display: grid;
        gap: 10px;
        padding: 10px;
        font-family: sans-serif;
      }
      .field-wrapper {
        display: grid;
        gap: 4px;
      }
      input, textarea {
        padding: 0.5em;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: sans-serif;
      }
      button[type="submit"] {
        padding: 0.5em 2em;
        width: fit-content;
      } 
      `}</style>

      {/* Map controls and connect to inputs */}
      {form.controls.map((control) => {
        const uid = control.name + '-' + control.key;

        switch (control.field.type) {
          case 'text':
            return (
              <div className="field-wrapper" key={uid}>
                <label htmlFor={uid}>{control.field.title}</label>
                <input id={uid} name={uid} type="text" ref={control.setRef} />
              </div>
            );

          case 'textarea':
            return (
              <div className="field-wrapper" key={uid}>
                <label htmlFor={uid}>{control.field.title}</label>
                <textarea id={uid} name={uid} ref={control.setRef} />
              </div>
            );

          default:
            return <p>Unknown field type: {control.field.type}</p>;
        }
      })}

      {/* Submit the form */}
      <button type="submit">Submit</button>

      {/* Show the current value */}
      <pre style={{ background: '#111', color: '#fff', padding: '10px' }}>
        <code>{JSON.stringify(form.value, null, 2)}</code>
      </pre>
    </form>
  );
}

export default App;
