import { MargaritaForm } from './margarita-form';
import { MargaritaFormField } from './margarita-form-types';

const fieldNameInitialValue = 'Hello world';

const commonField: MargaritaFormField = {
  name: 'fieldName',
  initialValue: fieldNameInitialValue,
};

const groupField: MargaritaFormField = {
  name: 'groupName',
  fields: [commonField],
};

const arrayField: MargaritaFormField = {
  name: 'arrayName',
  grouping: 'repeat-group',
  fields: [commonField],
};

describe('margaritaForm', () => {
  it('Create basic schema', () => {
    const form = new MargaritaForm({ fields: [commonField] });
    expect(form.controls).toHaveProperty(['fieldName']);
    expect(form.value).toHaveProperty(['fieldName'], fieldNameInitialValue);
  });
  it('Create group schema', () => {
    const form = new MargaritaForm({
      fields: [groupField],
    });
    expect(form.controls).toHaveProperty([
      'groupName',
      'controls',
      'fieldName',
    ]);
    expect(form.value).toHaveProperty(
      ['groupName', 'fieldName'],
      fieldNameInitialValue
    );
  });
  it('Create array schema', () => {
    const form = new MargaritaForm({
      fields: [arrayField],
    });
    expect(form.controls).toHaveProperty([
      'arrayName',
      'controlsArray',
      '0',
      'controls',
      'fieldName',
    ]);
    expect(form.value).toHaveProperty(
      ['arrayName', '0', 'fieldName'],
      fieldNameInitialValue
    );
  });
});
