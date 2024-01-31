# Margarita Form - Form library that makes creating forms easy 🔥

Start creating extendable reactive forms with any framework today.

## Forms for modern web development

Goal of margarita form is to help you to create, extend and validate forms easily. Margarita form provides methods to conditionally enable, transform and observe your form, it's value, state and everything related to it.

## Packages

- [React](#react) → `npm install @margarita-form/react` → [View React example](#example-dynamic-form-with-react)
- [Angular](#angular) → `npm install @margarita-form/angular` → [View Angular example](#example-dynamic-form-with-angular)
- [HTML and JS](#html-and-js) → `npm install @margarita-form/core` → [View HTML & JS example](#example-dynamic-form-with-html-and-js)
- [Other frameworks](#other-frameworks) → `npm install @margarita-form/core` → [View TypeScript example](#example-dynamic-form-with-other-frameworks)

## Features

- **Asynchronous validation** - Validate form fields with build in validators or create your own. Margarita form validation supports validators that can be functions, promises or even observables.
- **Schema based controls** - Form’s controls are created with a simple schema that consists of fields. Schema can be created with simple JSON data from your database or from javascript objects extended with custom functionality.
- **Conditional form fields** - With margarita form’s active and visible states you can control conditional cases for your form easily. Connect any function, promise or observable to render fields conditinally.
- **Written with TypeScript** - TypeScript support is crucial for modern libraries and so margarita form is build to be typescript native library with support to utilize your custom types.
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

```bash
npm install @margarita-form/react
```

#### Example dynamic form with React

**Component** / [readme-example.tsx](https://github.com/margarita-form/margarita-form/blob/main/apps/react-demos/src/app/readme-example/readme-example.tsx)

```tsx
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
```

**[View full React example app](https://github.com/margarita-form/margarita-form/tree/main/apps/react-demos/src/app)**

#### More resources

- [React reference docs (WIP)](https://margarita-form.github.io/margarita-form/modules/_margarita_form_react.html)
- [Even more dynamic form example that is used for testing stuff out](https://github.com/margarita-form/margarita-form/blob/main/apps/baking-oven/src/app/app.tsx)

### Angular

#### Install the [Angular package](https://www.npmjs.com/package/@margarita-form/angular):

```bash
npm install @margarita-form/angular
```

#### Example dynamic form with Angular

**Component** / [readme-example.component.ts](https://github.com/margarita-form/margarita-form/blob/main/apps/angular-demos/src/app/readme-example/readme-example.component.ts)

```ts
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
  standalone: true,
  imports: [CommonModule, MargaritaFormModule],
  styleUrl: './readme-example.component.scss',
  templateUrl: './readme-example.component.html',
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
```

**Template** / [readme-example.component.html](https://github.com/margarita-form/margarita-form/blob/main/apps/angular-demos/src/app/readme-example/readme-example.component.html)

```html
<!-- Render the current value -->
<h2>Current value</h2>
<code>{{ form.value | json }}</code>

<!-- Render the form -->
<h2>Form</h2>
<form *ngIf="form" [mfControl]="form">
  <!-- Map controls and connect to inputs -->
  <div class="field-wrapper" *ngFor="let control of form.controls">
    <label [for]="control.uid">{{ control.field.title }}</label>

    <!-- Use switch to render different types of fields -->
    <ng-container [ngSwitch]="control.field.type">
      <textarea *ngSwitchCase="'textarea'" [id]="control.uid" [name]="control.uid" type="text" [mfControl]="control"></textarea>
      <input *ngSwitchDefault [id]="control.uid" [name]="control.uid" [type]="control.field.type" [mfControl]="control" />
    </ng-container>
  </div>

  <!-- Submit the form -->
  <button type="submit">Submit</button>
</form>
```

**[View full Angular example app](https://github.com/margarita-form/margarita-form/tree/main/apps/angular-demos/src/app)**

#### More resources

- [Angular reference docs (WIP)](https://margarita-form.github.io/margarita-form/modules/_margarita_form_angular.html)

### HTML and JS

#### Add the standalone browser script for latest release

```html
<script src="https://unpkg.com/@margarita-form/core/margarita-form.min.js"></script>
```

or for specific version

```html
<script src="https://unpkg.com/@margarita-form/core@VERSION/margarita-form.min.js"></script>
```

#### Example dynamic form with HTML and JS

**Example file** / [vanilla-html-js.html](https://github.com/margarita-form/margarita-form/blob/main/apps/frameworkless-demos/src/vanilla-html-js.html)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Margarita Form / Vanilla HTML anf JS example</title>
    <script src="https://unpkg.com/@margarita-form/core/margarita-form.min.js"></script>
    <link rel="stylesheet" href="/styles-vanilla.css" />
  </head>
  <body>
    <header>
      <h1>Margarita Form / Vanilla HTML anf JS example</h1>
    </header>
    <main>
      <div class="form-wrapper">
        <!-- Render the current value -->
        <h2>Current value</h2>
        <code id="current-value"></code>

        <!-- Render the form -->
        <h2>Form</h2>
        <form *ngIf="form" [mfControl]="form">
          <!-- Map controls and connect to inputs -->
          <div class="form-fields-container">
            <!-- Fields are appended here -->
          </div>

          <!-- Submit the form -->
          <button type="submit">Submit</button>
        </form>
      </div>
    </main>

    <script>
      const form = MargaritaForm.createMargaritaForm({
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
          const currentValueEl = document.querySelector('#current-value');
          if (!currentValueEl) throw new Error('Element with id "current-value" was not found');
          currentValueEl.innerText = JSON.stringify(value);
        },
      });

      const formEl = document.querySelector('form');
      if (!formEl) throw new Error('Element with tag "form" was not found');
      form.setRef(formEl);

      const getInputEl = (control) => {
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
    </script>
  </body>
</html>
```

**[View full example file](https://github.com/margarita-form/margarita-form/blob/main/apps/frameworkless-demos/src/vanilla-html-js.html)**

#### More resources

- [Core reference docs (WIP)](https://margarita-form.github.io/margarita-form/modules/_margarita_form_core.html)

### Other frameworks

The plan is to make more framework specific libraries but even now you can use @margarita-form/core to implement the form logic into any project!

#### Install the [Core package](https://www.npmjs.com/package/@margarita-form/core):

```bash
npm install @margarita-form/core
```

#### Example dynamic form with other frameworks

**Example TypeScript** / [vanilla-typescript.ts](https://github.com/margarita-form/margarita-form/blob/main/apps/frameworkless-demos/src/app/vanilla-typescript/vanilla-typescript.ts)

```ts
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
```

**Example HTML** / [vanilla-typescript.html](https://github.com/margarita-form/margarita-form/blob/main/apps/frameworkless-demos/src/vanilla-typescript.html)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Margarita Form / Vanilla TypeScript example</title>
    <link rel="stylesheet" href="/styles-vanilla.css" />
  </head>
  <body>
    <header>
      <h1>Margarita Form / Vanilla TypeScript example</h1>
    </header>
    <main>
      <div class="form-wrapper">
        <!-- Render the current value -->
        <h2>Current value</h2>
        <code id="current-value"></code>

        <!-- Render the form -->
        <h2>Form</h2>
        <form *ngIf="form" [mfControl]="form">
          <!-- Map controls and connect to inputs -->
          <div class="form-fields-container">
            <!-- Fields are appended here -->
          </div>

          <!-- Submit the form -->
          <button type="submit">Submit</button>
        </form>
      </div>
    </main>

    <script type="module" src="/app/vanilla-typescript/vanilla-typescript.ts"></script>
  </body>
</html>
```

**[View full example app with Vite server](https://github.com/margarita-form/margarita-form/blob/main/apps/frameworkless-demos)**

#### More resources

- [Core reference docs (WIP)](https://margarita-form.github.io/margarita-form/modules/_margarita_form_core.html)

### Read more

Proper documentation is coming soon!
For now you can check [reference documentation](https://margarita-form.github.io/margarita-form/index.html) and the following examples!
