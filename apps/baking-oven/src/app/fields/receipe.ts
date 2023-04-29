import { CustomField } from '../app';

export const recipeFields: CustomField[] = [
  {
    type: 'text',
    name: 'title',
    title: 'Recipe title',
    initialValue: 'My epic recipe',
    validation: {
      required: true,
    },
  },
  {
    type: 'textarea',
    name: 'description',
    title: 'Description',
    validation: {
      required: true,
    },
    attributes: {
      placeholder: 'Enter a description',
      rows: 4,
    },
  },
  {
    type: 'repeatable',
    name: 'steps',
    title: 'Steps how to make the recipe',
    grouping: 'repeat-group',
    startWith: 2,
    template: {
      title: 'Step',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'text',
          validation: {
            required: true,
          },
          attributes: {
            placeholder: 'Step title',
          },
        },
        {
          name: 'description',
          title: 'Description',
          type: 'textarea',
          validation: {
            required: true,
          },
          attributes: {
            placeholder: 'Step description (keep it short!)',
            rows: 2,
          },
        },
      ],
    },
  },
];
