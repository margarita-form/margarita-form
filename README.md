# Margarita Form

## Modern form library made with TypeScript 🔥

Margarita form is inspired by [Angular's Reactive forms](https://angular.io/guide/reactive-forms) but build to work with any framework or library like React, Next.js, Gatsby.js, Vue or Svelte!

## Features

- Asynchronous validation
- Schema based controls
- Conditional form fields
- Written with TypeScript
- CMS & CRM compatible
- Storage and syncronization
- Form field localization
- Framework agnostic

## Get started

Proper documentation is coming soon!
For now you can check [reference documentation](https://margarita-form.github.io/margarita-form/modules.html) and the following examples!

### Packages

- [Core](https://www.npmjs.com/package/@margarita-form/core)
- [React](https://www.npmjs.com/package/@margarita-form/react)

### React

#### Install the [React package](https://www.npmjs.com/package/@margarita-form/react):

```
npm i @margarita-form/react
```

#### Example: Simple but dynamic form with React

```tsx
import { useMargaritaForm, MargaritaFormField } from '@margarita-form/react';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<MyFormField> {
  type: 'text' | 'textarea';
  title: string;
}

export function App() {
  const form = useMargaritaForm<MyFormValue, MyFormField>({
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
      valid: (form) => {
        console.log('Valid submit', { form });
      },
      invalid: (form) => {
        console.log('Invalid submit', { form });
      },
    },
    options: {
      handleSuccesfullSubmit: 'reset', // Change what happens when form is successfully submitted
      useStorage: false, // Change to "localStorage" or "sessionStorage" to enable persistence between page reloads
      useSyncronization: false, // Change to true to syncronize form value between tabs
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
```

Check out more: [a bit more complex but even more dynamic form example](https://github.com/margarita-form/margarita-form/blob/main/apps/baking-oven/src/app/app.tsx)

### Other's

The plan is to make more framework specific libraries but even now you can use @margarita-form/core to implement the form logic into any project!

#### Install the [Core package](https://www.npmjs.com/package/@margarita-form/core):

```
npm i @margarita-form/core
```

#### Import it into your project:

```typescript
import { createMargaritaForm, MargaritaFormField } from '@margarita-form/core';
```

#### Create a new form with single field:

```typescript
interface MyFormValue {
  myControl: string;
}

interface MyFormField extends MargaritaFormField<MyFormField> {
  title: string;
}

const form = createMargaritaForm<MyFormValue, MyFormField>({
  fields: [{ name: 'myControl', title: 'My Control', validation: { required: true } }],
  handleSubmit: {
    valid: (form) => {
      /* Handle valid submission */
    },
  },
});
```

#### Get control from the form:

```typescript
const myControl = form.getControl('myControl');
```

or

```typescript
form.controls.map((control) => {
  /* Do something with the controls! */
});
```

And the rest is up to your framework!
