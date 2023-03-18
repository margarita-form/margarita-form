# Margarita Form

## Modern form library made with TypeScript 🔥

Margarita form is heavily inspired by [Angular's Reactive forms](https://angular.io/guide/reactive-forms) but unlike many form libraries, margarita forms is build to be framework agnostic meaning that it works with any framework or library like React, Next.js, Gatsby.js, Vue or Svelte!

## Get started

### React

#### Install the React package: 
```
npm i @margarita-form/react
```

#### Import it into your project: 
```typescript
import { useMargaritaForm } from '@margarita-form/react'
```

#### Create a new form with single field: 
```typescript
interface MyFormValue {
  myControl: string;
}

const form = useMargaritaForm<MyFormValue>({
  fields: [{ name: 'myControl', validation: { required: true } }],
  handleSubmit: {
    valid: (formValue) => {
      /* Handle valid submission */
    },
  },
});
```

#### Get control from the form:
```typescript
const myControl = form.getControl('myControl');
```

#### Connect controls to your inputs
```typescript
<form ref={form.setRef}>
  <input type="text" ref={myControl.setRef} placeholder="My Control" />
  <button type="submit">Submit</button>
</form>
```

#### Full example
```typescript
import { useMargaritaForm } from '@margarita-form/react';

export function App() {
  interface MyFormValue {
    myControl: string;
  }

  const form = useMargaritaForm<MyFormValue>({
    fields: [{ name: 'myControl', validation: { required: true } }],
    handleSubmit: {
      valid: (formValue) => {
        /* Handle valid submission */
      },
    },
  });

  const myControl = form.getControl('myControl');

  return (
    <form ref={form.setRef}>
      <input type="text" ref={myControl.setRef} placeholder="My Control" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default App;
```

### Other's

The plan is to make more framework specific libraries but even now you can use @margarita-form/core to implement the form logic into any project!

#### Install the Core package: 
```
npm i @margarita-form/core
```

#### Import it into your project: 
```typescript
import { createMargaritaForm } from '@margarita-form/react'
```

#### Create a new form with single field: 
```typescript
interface MyFormValue {
  myControl: string;
}

const form = createMargaritaForm<MyFormValue>({
  fields: [{ name: 'myControl', validation: { required: true } }],
  handleSubmit: {
    valid: (formValue) => {
      /* Handle valid submission */
    },
  },
});
```

#### Get control from the form:
```typescript
const myControl = form.getControl('myControl');
```

And the rest is up to your framework!
