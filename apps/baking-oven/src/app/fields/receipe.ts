import { CustomField } from '../app';

const recipeFields: CustomField[] = [
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
    initialValue: 'This is a recipe for a delicious meal',
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
    grouping: 'array',
    startWith: ['note', 'step', 'step'],
    config: { addMetadata: true },
    fields: [
      {
        title: 'Step',
        name: 'step',
        type: 'group',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'text',
            initialValue: 'Step title',
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
      {
        name: 'note',
        title: 'Note',
        type: 'group',
        fields: [
          {
            name: 'text',
            title: 'Text',
            type: 'textarea',
            validation: {
              required: true,
            },
          },
        ],
      },
    ],
  },
  {
    type: 'group',
    name: 'author',
    title: 'Author',
    initialValue: {
      name: 'Teemukissa',
      title: 'Master chef',
    },
    fields: [
      {
        name: 'name',
        title: 'Name',
        type: 'text',
        initialValue: 'John Doe',
        validation: {
          required: true,
        },
      },
      {
        name: 'title',
        title: 'Title',
        type: 'text',
        initialValue: 'Chef',
      },
    ],
  },
  {
    name: 'state',
    title: 'State',
    type: 'radio',
    initialValue: 'draft',
    options: [
      {
        label: 'Draft',
        value: 'draft',
      },
      {
        label: 'Published',
        value: 'published',
      },
    ],
  },
  {
    name: 'tags',
    title: 'Tags',
    type: 'checkbox-group',
    initialValue: ['tag1', 'tag2'],
    options: Array.from({ length: 5 }, (_, i) => ({
      label: `Tag ${i + 1}`,
      value: `tag${i + 1}`,
    })),
  },
  {
    name: 'allowComments',
    title: 'Allow comments',
    type: 'checkbox',
    initialValue: true,
  },
];

export const recipeConfig = {
  name: 'recipe',
  fields: recipeFields,
};
