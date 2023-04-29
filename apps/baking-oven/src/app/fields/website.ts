import { CustomField } from '../app';

export const websiteFields: CustomField[] = [
  {
    type: 'text',
    name: 'title',
    title: 'Page title',
    initialValue: 'Hello world!',
    validation: {
      required: true,
    },
  },
  {
    type: 'textarea',
    name: 'description',
    title: 'Page description',
    validation: {
      required: true,
    },
    attributes: {
      placeholder: 'Enter a description',
      rows: 2,
    },
  },
];
