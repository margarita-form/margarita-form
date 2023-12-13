import { MargaritaFormField, MargaritaFormFieldState } from '@margarita-form/core';
import { map } from 'rxjs';
import { CustomField } from '../app';

const activeArea =
  (name: string): MargaritaFormFieldState =>
  ({ control }) => {
    type Value = { areas?: string[] };
    type ExperienceControl = MargaritaFormField<{ value: Value }>;
    const experienceControl = control.parent.getControl<ExperienceControl>('experience');
    if (!experienceControl) return false;
    return experienceControl.valueChanges.pipe(
      map((value) => {
        if (!value.areas) return false;
        return value.areas.includes(name);
      })
    );
  };

const conditionalsFields: CustomField[] = [
  {
    type: 'group',
    name: 'questions',
    title: 'Some questions that will determine the outcome',
    grouping: 'group',
    config: { addMetadata: true },
    fields: [
      {
        title: 'Experience',
        name: 'experience',
        type: 'group',
        fields: [
          {
            name: 'years',
            title: 'Total years of experience',
            type: 'number',
          },
          {
            name: 'areas',
            title: 'Areas of expertise',
            type: 'checkbox-group',
            validation: { required: true, min: 1 },
            options: [
              { label: 'Fullstack', value: 'fullstack' },
              { label: 'Frontend', value: 'frontend' },
              { label: 'Backend', value: 'backend' },
              { label: 'DevOps', value: 'devops' },
            ],
          },
        ],
      },
      {
        title: 'Fullstack experience',
        name: 'fullstack',
        type: 'group',
        active: activeArea('fullstack'),
        fields: [
          {
            name: 'years',
            title: 'Years of experience in fullstack',
            type: 'number',
          },
          {
            name: 'skills',
            title: 'Skills',
            type: 'checkbox-group',
            validation: { required: true, min: 1 },
            options: [
              { label: 'React', value: 'react' },
              { label: 'Angular', value: 'angular' },
              { label: 'Vue', value: 'vue' },
              { label: 'Svelte', value: 'svelte' },
              { label: 'Node.js', value: 'nodejs' },
              { label: 'Express.js', value: 'expressjs' },
              { label: 'Django', value: 'django' },
              { label: 'Flask', value: 'flask' },
              { label: 'Margarita Form', value: 'margarita-form' },
            ],
          },
        ],
      },
      {
        title: 'Frontend experience',
        name: 'frontend',
        type: 'group',
        active: activeArea('frontend'),
        fields: [
          {
            name: 'years',
            title: 'Years of experience in frontend',
            type: 'number',
          },
          {
            name: 'skills',
            title: 'Skills',
            type: 'checkbox-group',
            validation: { required: true, min: 1 },
            options: [
              { label: 'React', value: 'react' },
              { label: 'Angular', value: 'angular' },
              { label: 'Vue', value: 'vue' },
              { label: 'Svelte', value: 'svelte' },
              { label: 'Margarita Form', value: 'margarita-form' },
            ],
          },
        ],
      },
      {
        title: 'Backend experience',
        name: 'backend',
        type: 'group',
        active: activeArea('backend'),
        fields: [
          {
            name: 'years',
            title: 'Years of experience in backend',
            type: 'number',
          },
          {
            name: 'skills',
            title: 'Skills',
            type: 'checkbox-group',
            validation: { required: true, min: 1 },
            options: [
              { label: 'Node.js', value: 'nodejs' },
              { label: 'PHP', value: 'php' },
              { label: 'Python', value: 'python' },
              { label: 'Java', value: 'java' },
              { label: 'Go', value: 'go' },
            ],
          },
        ],
      },
      {
        title: 'DevOps experience',
        name: 'devops',
        type: 'group',
        active: activeArea('devops'),
        fields: [
          {
            name: 'years',
            title: 'Years of experience in DevOps',
            type: 'number',
          },
          {
            name: 'tools',
            title: 'Tools',
            type: 'checkbox-group',
            validation: { required: true, min: 1 },
            options: [
              { label: 'Docker', value: 'docker' },
              { label: 'Kubernetes', value: 'kubernetes' },
              { label: 'Ansible', value: 'ansible' },
              { label: 'Jenkins', value: 'jenkins' },
              { label: 'GitLab CI/CD', value: 'gitlab-ci' },
              { label: 'AWS', value: 'aws' },
              { label: 'Azure', value: 'azure' },
              { label: 'Google Cloud', value: 'gcp' },
            ],
          },
        ],
      },
    ],
  },
];

export const conditionalsConfig = {
  name: 'conditionals',
  fields: conditionalsFields,
};
