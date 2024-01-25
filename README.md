# Margarita Form

## Form library that makes creating forms easy 🔥

Start creating extendable reactive forms with any framework today.

### Forms for modern web development

Goal of margarita form is to help you to create, extend and validate forms easily. Margarita form provides methods to conditionally enable, transform and observe your form, it's value, state and everything related to it.

### Packages

- [React](https://www.npmjs.com/package/@margarita-form/react) → `npm install @margarita-form/react` → [View React example](#example-dynamic-form-with-react)
- [Angular](https://www.npmjs.com/package/@margarita-form/angular) → `npm install @margarita-form/angular` → [View Angular example](#example-dynamic-form-with-angular)
- [Core](https://www.npmjs.com/package/@margarita-form/core) → `npm install @margarita-form/core` → [View TypeScript example](#example-form-with-core)

## Features

- **Asynchronous validation** - Validate form fields with build in validators or create your own. Margarita form validation supports validators that can be functions, promises or even observables.
- **Schema based controls** - Form’s controls are created with a simple schema that consists of fields. Schema can be created with simple JSON data from your database or from javascript objects extended with custom functionality.
- **Conditional form fields** - With margarita form’s active and visible states you can control conditional cases for your form easily. Connect any function, promise or observable to render fields conditinally.
- **Written with TypeScript** - Typescript support is crucial for modern libraries and so margarita form is build to be typescript native library with support to utilize your custom types.
- **CMS & CRM compatible** - It’s possible to create form schema with any CMS or CMR and use all features of margarita form with that. Existing forms can be extended with margarita form’s api and data can be submitted to where ever needed.
- **Storage and syncronization** - You can enable locally stored data to allow users continue filling the form later. On top of storage you can allow form data syncronization between tabs via [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
- **Form field localization** - Margarita form supports localization for form fields. You can create forms that generate values or you can localize form's content.
- **Framework agnostic** - Margarita form is build to be framework agnostic. It can be used with any framework or without any framework at all.

## How Margarita form works in action?

1. **Define your schema.** Schema is the foundation for your form. Schema is an array of fields and with each field you can define controls name, type, state, behavior and validations. From schema / fields margarita form will create controls that then are used in your code to control form's value, state and content.

2. **Connect your ui components to form controls.** Margarita form does not define how your form should look like. You easily connect any UI components to the form controls and create dynamic forms without hassle.

3. **Handle form submission.** Saving form data is easy. Before user can submit the form, margarita form validates all active controls. If form is valid, a callback you defined get run with a form context and saving data to any target can be handled with native Promise api.

## Get started

### React

#### Install the [React package](https://www.npmjs.com/package/@margarita-form/react):

```
npm install @margarita-form/react
```

#### Example dynamic form with React

```tsx
// src/index.tsx
import { useMargaritaForm, MargaritaFormField } from '@margarita-form/react';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<{ fields: MyFormField }> {
  type: 'text' | 'textarea';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

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
```

Check out more: [a bit more complex but even more dynamic form example](https://github.com/margarita-form/margarita-form/blob/main/apps/baking-oven/src/app/app.tsx)

### Angular

#### Install the [Angular package](https://www.npmjs.com/package/@margarita-form/angular):

```
npm install @margarita-form/angular
```

#### Example dynamic form with Angular

```ts
// src/app/form.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MargaritaFormField, MargaritaFormModule, MargaritaFormService } from '@margarita-form/angular';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<{ fields: MyFormField }> {
  type: 'text' | 'textarea';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

@Component({
  selector: 'app-readme-example',
  standalone: true,
  imports: [CommonModule, MargaritaFormModule],
  styles: `
    // Very basic styling
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      h2 {
        font-size: 16px
      }
      form {
        display: grid;
        gap: 10px;
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
        width: 100%;
      }
      button[type="submit"] {
        padding: 0.5em 2em;
        width: fit-content;
      } 
      code {
        display: block;
        background: #111;
        color: #fff;
        padding: 20px;
      }
    }
  `,
  template: `
    <!-- Render the current value -->
    <h2>Current value</h2>
    <code>{{ form.value | json }}</code>

    <!-- Render the form -->
    <h2>Form</h2>
    <form *ngIf="form" [mfControl]="form">
      <!-- Map controls and connect to inputs -->
      <div class="field-wrapper" *ngFor="let control of form.controls">
        <label [for]="control.uid">{{ control.field.title }}</label>

        <ng-container [ngSwitch]="control.field.type">
          <input *ngSwitchCase="'text'" [id]="control.uid" [name]="control.uid" type="text" [mfControl]="control" />
          <textarea *ngSwitchCase="'textarea'" [id]="control.uid" [name]="control.uid" type="text" [mfControl]="control"></textarea>
          <div *ngSwitchDefault>Unknown field type: {{ control.field.type }}</div>
        </ng-container>
      </div>

      <!-- Submit the form -->
      <button type="submit">Submit</button>
    </form>
  `,
})
export class ReadmeExampleComponent {
  private formService = inject(MargaritaFormService);

  public form = this.formService.createForm<RootField>({
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
      valid: async ({ value }) => {
        console.log('Valid submit', { value });
      },
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
```

### Other's

The plan is to make more framework specific libraries but even now you can use @margarita-form/core to implement the form logic into any project!

### Example form with core

#### Install the [Core package](https://www.npmjs.com/package/@margarita-form/core):

```
npm install @margarita-form/core
```

#### Import it into your project:

```typescript
import { createMargaritaForm, MargaritaFormField } from '@margarita-form/core';
```

#### Create a new form with single field:

```typescript
import { createMargaritaForm, MargaritaFormField } from '@margarita-form/core';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<{ fields: MyFormField }> {
  type: 'text' | 'textarea';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

export const form = createMargaritaForm<RootField>({
  name: 'my-form',
  fields: [{ name: 'myControl', type: 'text', title: 'My Control', validation: { required: true } }],
  handleSubmit: {
    valid: async ({ control: form, value }) => {
      console.log('Valid submit', { form, value });
    },
  },
});
```

#### Get control from the form:

```typescript
const myControl = form.getControl('myControl');
if (!myControl) throw 'Control "myControl" was not found!"';
```

or

```typescript
form.controls.map((control) => {
  /* Do something with the controls! */
});
```

And the rest is up to your framework!

### Read more

Proper documentation is coming soon!
For now you can check [reference documentation](https://margarita-form.github.io/margarita-form/index.html) and the following examples!
