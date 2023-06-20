import { CustomField } from '../app';

export const websiteFields: CustomField[] = [
  {
    type: 'text',
    name: 'title',
    title: 'Page title',
    initialValue: 'Hello world!',
    localize: true,
    validation: {
      required: true,
    },
  },
  {
    type: 'textarea',
    name: 'description',
    title: 'Page description',
    localize: true,
    validation: {
      required: true,
    },
    attributes: {
      placeholder: 'Enter a description',
      rows: 2,
    },
  },
  {
    type: 'text',
    name: 'password',
    title: 'Password',
    validation: {
      required: true,
      password: 'regular',
    },
    attributes: {
      type: 'password',
      placeholder: 'Enter a password',
    },
  },
];
