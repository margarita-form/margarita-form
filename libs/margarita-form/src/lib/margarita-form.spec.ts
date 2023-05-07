import { createMargaritaForm } from './create-margarita-form';
import { MFF, MargaritaFormField } from './margarita-form-types';

const fieldNameInitialValue = 'Hello world';

const commonField: MargaritaFormField<MFF> = {
  name: 'fieldName',
  initialValue: fieldNameInitialValue,
};

const fromParentValue = fieldNameInitialValue + '-from-parent';
const fromRootValue = fieldNameInitialValue + '-from-root';

const groupField: MargaritaFormField = {
  name: 'groupName',
  fields: [commonField],
  initialValue: {
    fieldName: fromParentValue,
  },
};

const arrayField: MargaritaFormField = {
  name: 'arrayName',
  grouping: 'repeat-group',
  fields: [commonField],
};

type ArrayField = { arrayName: unknown[] };

describe('margaritaForm', () => {
  it('Create single level schema with one field and check initial value', () => {
    const form = createMargaritaForm<unknown, MFF>({ name: 'test', fields: [commonField] });
    expect(form.value).toHaveProperty(['fieldName'], fieldNameInitialValue);
    form.cleanup();
  });

  it("Create two level schema with one field each and parent's initial value overriding child's value", () => {
    const form = createMargaritaForm<unknown, MFF>({ name: 'test', fields: [groupField] });
    expect(form.value).toHaveProperty(['groupName', 'fieldName'], fromParentValue);
    form.cleanup();
  });

  it("Create two level schema with one field each and root's initial value overriding all child values", () => {
    const form = createMargaritaForm<unknown, MFF>({
      name: 'test',
      fields: [groupField],
      initialValue: {
        groupName: {
          fieldName: fromRootValue,
        },
      },
    });
    expect(form.value).toHaveProperty(['groupName', 'fieldName'], fromRootValue);
    form.cleanup();
  });

  it('Create two level schema with first level being an "repeat-group". Starting with 1 child.', () => {
    const form = createMargaritaForm<ArrayField, MFF>({ name: 'test', fields: [arrayField] });
    expect(form.value).toHaveProperty(['arrayName', '0', 'fieldName'], fieldNameInitialValue);
    form.cleanup();
  });

  it('Create two level schema with first level being an "repeat-group". Starting with 0 children.', () => {
    const repeat0 = { ...arrayField, startWith: 0 };
    const form = createMargaritaForm<ArrayField, MFF>({ name: 'test', fields: [repeat0] });
    expect(form.value).not.toHaveProperty(['arrayName']);
    form.cleanup();
  });

  it('Create two level schema with first level being an "repeat-group". Starting with 2 children created with "startWith" property', () => {
    const repeat2 = { ...arrayField, startWith: 2 };
    const form = createMargaritaForm<ArrayField, MFF>({ name: 'test', fields: [repeat2] });
    expect(form.value).toHaveProperty(['arrayName', '0', 'fieldName'], fieldNameInitialValue);
    expect(form.value).toHaveProperty(['arrayName', '1', 'fieldName'], fieldNameInitialValue);
    expect(form.value.arrayName).toHaveLength(2);
    form.cleanup();
  });

  it('Create two level schema with first level being an "repeat-group". Starting with 3 children created with parent\'s initial value', () => {
    const initialValue = { fieldName: fieldNameInitialValue };
    const initialValueOf3 = { ...arrayField, initialValue: [initialValue, initialValue, initialValue] };
    const form = createMargaritaForm<ArrayField, MFF>({ name: 'test', fields: [initialValueOf3] });
    expect(form.value).toHaveProperty(['arrayName', '0', 'fieldName'], fieldNameInitialValue);
    expect(form.value).toHaveProperty(['arrayName', '1', 'fieldName'], fieldNameInitialValue);
    expect(form.value).toHaveProperty(['arrayName', '2', 'fieldName'], fieldNameInitialValue);
    expect(form.value.arrayName).toHaveLength(3);
    form.cleanup();
  });
});
