import { CustomField } from '../app';

const helloWorldFields: CustomField[] = [
  {
    type: 'text',
    name: 'title',
    title: 'Title',
    defaultValue: 'Hello world!',
    validation: {
      required: true,
    },
  },
];

export const helloWorldConfig = {
  name: 'helloWorld',
  fields: helloWorldFields,
};
