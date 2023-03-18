import { createMargaritaForm } from './margarita-form';
import { MargaritaFormField } from './margarita-form-types';

const fieldNameInitialValue = 'Hello world';

const commonField: MargaritaFormField = {
  name: 'fieldName',
  initialValue: fieldNameInitialValue,
};

/*
const groupField: MargaritaFormField = {
  name: 'groupName',
  fields: [commonField],
};

const arrayField: MargaritaFormField = {
  name: 'arrayName',
  grouping: 'repeat-group',
  fields: [commonField],
};
*/

describe('margaritaForm', () => {
  it('Create basic schema', () => {
    const form = createMargaritaForm({ fields: [commonField] });
    expect(form.value).toHaveProperty(['fieldName'], fieldNameInitialValue);
  });
});
