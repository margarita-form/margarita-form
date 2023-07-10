import { CustomField } from '../app';

export const websiteFields: CustomField[] = [
  {
    type: 'text',
    name: 'title',
    title: 'Page title',
    initialValue: 'Hello world!',
    localize: true,
    i18n: {
      description: {
        en: 'This is the title of the page',
        fi: 'Tämä on sivun otsikko',
      },
    },
    validation: {
      required: true,
    },
  },
  {
    type: 'textarea',
    name: 'description',
    title: 'Page description',
    localize: true,
    i18n: {
      description: {
        en: 'This is the description of the page',
        fi: 'Tämä on sivun kuvaus',
      },
    },
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
