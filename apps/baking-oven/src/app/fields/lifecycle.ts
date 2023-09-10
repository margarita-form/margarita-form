import { CustomField } from '../app';

export const lifecycleFields: CustomField[] = [
  {
    type: 'text',
    name: 'level-1-text',
    title: 'Level 1 text',
    initialValue: 'level-1-text-initial-value',
  },
  {
    type: 'group',
    name: 'level-1-group',
    title: 'Level 1 group',
    fields: [
      {
        type: 'text',
        name: 'level-2-text',
        title: 'Level 2 text',
        initialValue: 'level-2-text-initial-value',
      },
    ],
  },

  {
    type: 'repeatable',
    name: 'level-1-array',
    title: 'Level 1 array',
    grouping: 'array',
    // startWith: ['level-2-group', 'level-2-group', 'level-2-group'],
    startWith: 2,
    config: {
      addMetadata: true,
    },
    fields: [
      {
        title: 'Level 2 group',
        name: 'level-2-group',
        type: 'group',
        fields: [
          {
            type: 'text',
            name: 'level-3-text',
            title: 'Level 3 text',
            initialValue: 'level-3-text-initial-value',
          },
        ],
      },
    ],
  },
];
