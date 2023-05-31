import { createMargaritaForm } from './create-margarita-form';
import { MFF, MargaritaFormField } from './margarita-form-types';
import { nanoid } from 'nanoid';

const fieldNameInitialValue = 'Hello world';
const anotherInitialValue = 'Live long and prosper';

const commonField: MargaritaFormField<MFF> = {
  name: 'fieldName',
  initialValue: fieldNameInitialValue,
};

const uncommonField: MargaritaFormField<MFF> = {
  name: 'anotherOne',
  initialValue: anotherInitialValue,
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

const uncommonGroupField: MargaritaFormField = {
  name: 'groupName',
  fields: [commonField, uncommonField],
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
  it('#1 Create single level schema with one field and check initial value', () => {
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [commonField] });
    expect(form.value).toHaveProperty([commonField.name], fieldNameInitialValue);
    form.cleanup();
  });

  it("#2 Create two level schema with one field each and parent's initial value overriding child's value", () => {
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [groupField] });
    expect(form.value).toHaveProperty([groupField.name, commonField.name], fromParentValue);
    form.cleanup();
  });

  it("#3 Create two level schema with one field each and root's initial value overriding all child values", () => {
    const form = createMargaritaForm<unknown, MFF>({
      name: nanoid(),
      fields: [groupField],
      initialValue: {
        groupName: {
          fieldName: fromRootValue,
        },
      },
    });
    expect(form.value).toHaveProperty([groupField.name, commonField.name], fromRootValue);
    form.cleanup();
  });

  it('#4 Create two level schema with first level being an "repeat-group". Starting with 1 child.', () => {
    const form = createMargaritaForm<ArrayField, MFF>({ name: nanoid(), fields: [arrayField] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], fieldNameInitialValue);
    form.cleanup();
  });

  it('#5 Create two level schema with first level being an "repeat-group". Starting with 0 children.', () => {
    const repeat0 = { ...arrayField, startWith: 0 };
    const form = createMargaritaForm<ArrayField, MFF>({ name: nanoid(), fields: [repeat0] });
    expect(form.value).toHaveProperty([arrayField.name], undefined);
    form.cleanup();
  });

  it('#6 Create two level schema with first level being an "repeat-group". Starting with 2 children created with "startWith" property', () => {
    const repeat2 = { ...arrayField, startWith: 2 };
    const form = createMargaritaForm<ArrayField, MFF>({ name: nanoid(), fields: [repeat2] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], fieldNameInitialValue);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], fieldNameInitialValue);
    expect(form.value.arrayName).toHaveLength(2);
    form.cleanup();
  });

  it('#7 Create two level schema with first level being an "repeat-group". Starting with 3 children created with parent\'s initial value', () => {
    const initialValue = { fieldName: fieldNameInitialValue };
    const initialValueOf3 = { ...arrayField, initialValue: [initialValue, initialValue, initialValue] };
    const form = createMargaritaForm<ArrayField, MFF>({ name: nanoid(), fields: [initialValueOf3] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], fieldNameInitialValue);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], fieldNameInitialValue);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], fieldNameInitialValue);
    expect(form.value.arrayName).toHaveLength(3);
    form.cleanup();
  });

  it('#8 Create single level schema where root value is set with setValue', () => {
    const value = '#8';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [commonField, uncommonField, groupField] });
    form.setValue({ [commonField.name]: value });
    expect(form.value).toHaveProperty([commonField.name], value);
    expect(form.value).toHaveProperty([uncommonField.name], undefined);
    form.cleanup();
  });

  it('#9 Create single level schema where control value is set with setValue', () => {
    const value = '#9';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [commonField] });
    const control = form.getControl(commonField.name);
    control && control.setValue(value);
    expect(form.value).toHaveProperty([commonField.name], value);
    form.cleanup();
  });

  it('#10 Create two level schema where root value is set with setValue', () => {
    const value = '#10';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [groupField] });
    form.setValue({ [groupField.name]: { [commonField.name]: value } });
    expect(form.value).toHaveProperty([groupField.name, commonField.name], value);
    form.cleanup();
  });

  it('#11 Create two level schema where control value is set with setValue', () => {
    const value = '#11';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [groupField] });
    const group = form.getControl(groupField.name);
    const control = group?.getControl(commonField.name);
    control?.setValue(value);
    expect(form.value).toHaveProperty([groupField.name, commonField.name], value);
    expect(control?.value).toBe(value);
    form.cleanup();
  });

  it('#12 Create single level schema where control array value is set with setValue', () => {
    const value = '#12';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [arrayField] });
    form.setValue({ [arrayField.name]: [{ [commonField.name]: value }] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], value);
    form.cleanup();
  });

  it('#13 Create single level schema where control array is continued with setValue', () => {
    const value = '#13';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [arrayField] });
    form.setValue({ [arrayField.name]: [{ [commonField.name]: value }, { [commonField.name]: value }] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], value);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], value);
    const control = form.getControl([arrayField.name, 1, commonField.name]);
    expect(control?.value).toBe(value);
    form.cleanup();
  });

  it("#14 Create single level schema where control's value is set from root with patch", () => {
    const value = '#14';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [commonField, uncommonField] });
    form.patchValue({ [commonField.name]: value });
    expect(form.value).toHaveProperty([commonField.name], value);
    expect(form.value).toHaveProperty([uncommonField.name], uncommonField.initialValue);
    form.cleanup();
  });

  it("#15 Create two level schema where control's value is set from root with patch", () => {
    const value = '#15';
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [uncommonGroupField, uncommonField] });
    form.patchValue({ [groupField.name]: { [commonField.name]: value } });
    expect(form.value).toHaveProperty([uncommonField.name], uncommonField.initialValue);
    expect(form.value).toHaveProperty([groupField.name, commonField.name], value);
    expect(form.value).toHaveProperty([groupField.name, uncommonField.name], undefined);
    form.cleanup();
  });
});
