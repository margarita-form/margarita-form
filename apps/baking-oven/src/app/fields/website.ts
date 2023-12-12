import { CustomField } from '../app';

const websiteFields: CustomField[] = [
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
  {
    type: 'group',
    name: 'content',
    title: 'Page content array',
    localize: true,
    config: { localization: { localizationOutput: 'array' } },
    handleLocalize: {
      parent: () => {
        return {
          title: 'Localized array',
          type: 'localized-array',
        };
      },
      child: ({ locale }) => {
        return {
          title: `Section (${locale})`,
          type: 'group',
        };
      },
    },
    fields: [
      {
        name: 'sectionName',
        title: 'Section name',
        type: 'text',
        initialValue: 'Section X',
        validation: {
          required: true,
        },
      },
      {
        name: 'sectionContent',
        title: 'Section content',
        type: 'textarea',
        initialValue: 'Section content',
        validation: {
          required: true,
        },
      },
    ],
  },
];

export const websiteConfig = {
  name: 'Website',
  fields: websiteFields,
};
