import { createMargaritaForm } from './create-margarita-form';
import { MFC, MFF, MargaritaFormField } from './margarita-form-types';
import { nanoid } from 'nanoid';

const fieldNameInitialValue = 'Hello world';
const anotherInitialValue = 'Live long and prosper';

const commonField: MargaritaFormField<MFF> = {
  name: 'fieldName',
  initialValue: fieldNameInitialValue,
};

const undefinedField: MargaritaFormField<MFF> = {
  name: 'undefinedField',
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
  it('#0 Common getters', () => {
    const locales = ['en', 'fi'];
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [groupField, arrayField], locales });
    const groupControl = form.getControl([groupField.name]);
    const arrayControl = form.getControl([arrayField.name]);
    const commonControl = form.getControl([groupField.name, commonField.name]);
    if (!groupControl || !arrayControl || !commonControl) throw 'No control found!';
    expect(commonControl.form).toBe(form);
    expect(commonControl.root).toBe(form);
    expect(commonControl.parent).toBe(groupControl);
    expect(commonControl.config).toBe(form.config);
    expect(commonControl.locales).toBe(form.locales);
    expect(commonControl.locales).toBe(locales);
    expect(commonControl.name).toBe(commonField.name);
    expect(commonControl.field).toBe(commonField);
    expect(commonControl.index).toBe(0);
    expect(commonControl.value).toBe(fromParentValue);
    expect(commonControl.state).toHaveProperty('valid');
    expect(commonControl.validators).toHaveProperty('required');
    // Group
    expect(groupControl.grouping).toBe('group');
    expect(groupControl.expectArray).toBe(false);
    expect(groupControl.expectGroup).toBe(true);
    expect(groupControl.expectChildControls).toBe(true);
    expect(groupControl.hasControls).toBe(true);
    expect(groupControl.hasActiveControls).toBe(true);
    expect(groupControl.controls).toHaveProperty('0', commonControl);
    expect(groupControl.activeControls).toHaveProperty('0', commonControl);
    // Array
    expect(arrayControl.grouping).toBe('repeat-group');
    expect(arrayControl.expectArray).toBe(true);
    expect(arrayControl.expectGroup).toBe(false);
    expect(arrayControl.expectChildControls).toBe(true);
    expect(arrayControl.hasControls).toBe(true);
    expect(arrayControl.hasActiveControls).toBe(true);
    expect(arrayControl.controls).toHaveProperty(['0', 'controls', '0', 'name'], commonControl.name);
    expect(arrayControl.activeControls).toHaveProperty(['0', 'controls', '0', 'name'], commonControl.name);

    form.cleanup();
  });

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

  it('#16 Create new controls programatically', () => {
    const form = createMargaritaForm<unknown, MFF>({ name: nanoid(), fields: [] });

    form.addControl(commonField);
    form.addControl(undefinedField);
    form.addControl({ ...arrayField, startWith: 3 });

    expect(form.value).toHaveProperty([commonField.name], commonField.initialValue);
    expect(form.value).toHaveProperty([undefinedField.name], undefined);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], commonField.initialValue);

    form.getOrAddControl({ ...commonField, initialValue: 'Should not be this value!' });
    expect(form.value).toHaveProperty([commonField.name], commonField.initialValue);
    form.getOrAddControl({ ...commonField, name: 'actuallyNewControl', initialValue: 'actually new value' });
    expect(form.value).toHaveProperty(['actuallyNewControl'], 'actually new value');

    const arrayControl = form.getControl(arrayField.name);
    if (!arrayControl || !Array.isArray(arrayControl.value)) throw 'No array control found!';
    expect(form.value).not.toHaveProperty([arrayField.name, '3']);
    expect(form.value).not.toHaveProperty([arrayField.name, '4']);
    arrayControl.appendRepeatingControls();
    expect(form.value).toHaveProperty([arrayField.name, '3', commonField.name], commonField.initialValue);
    expect(form.value).not.toHaveProperty([arrayField.name, '4']);
    arrayControl.appendRepeatingControls();
    arrayControl.appendRepeatingControls();
    arrayControl.appendRepeatingControls();
    arrayControl.appendRepeatingControls();
    expect(form.value).toHaveProperty([arrayField.name, '4', commonField.name], commonField.initialValue);

    form.cleanup();
  });

  it('#17 Remove new controls programatically', () => {
    const form = createMargaritaForm<unknown, MFF>({
      name: nanoid(),
      fields: [commonField, uncommonField, { ...arrayField, startWith: 3 }],
    });

    expect(form.value).toHaveProperty([commonField.name], commonField.initialValue);
    form.removeControl(commonField.name);
    expect(form.value).not.toHaveProperty([commonField.name]);
    const arr = form.getControl(arrayField.name);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], commonField.initialValue);
    if (arr) {
      arr.removeControl(0);
      expect(form.value).not.toHaveProperty([arrayField.name, '2']);
    }
    form.cleanup();
  });

  it('#18 Reorder (move) new controls programatically', () => {
    const form = createMargaritaForm<unknown, MFF>({
      name: nanoid(),
      fields: [{ ...arrayField, startWith: 3 }],
    });

    const arrayControl = form.getControl([arrayField.name]);
    const firstArrayGroup = form.getControl([arrayField.name, 0]);
    const firstArrayControl = form.getControl([arrayField.name, 0, commonField.name]);
    const thirdArrayControl = form.getControl([arrayField.name, 2, commonField.name]);

    if (!arrayControl || !firstArrayGroup || !firstArrayControl || !thirdArrayControl) throw 'No control found!';

    const value = 'first!';
    firstArrayControl.setValue(value);
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], value);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], commonField.initialValue);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], commonField.initialValue);

    firstArrayGroup.moveToIndex(2);
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], commonField.initialValue);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], commonField.initialValue);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], value);

    form.cleanup();
  });

  it('#19 Check that paths work as should', () => {
    const form = createMargaritaForm<unknown, MFF>({
      name: nanoid(),
      fields: [commonField, groupField, { ...arrayField, startWith: 3 }],
    });

    const groupControl = form.getControl([groupField.name]);
    const commonControl = form.getControl([groupField.name, commonField.name]);
    const arrayControl = form.getControl([arrayField.name]);
    const firstArrayControl = form.getControl([arrayField.name, 0, commonField.name]);

    if (!groupControl || !commonControl || !arrayControl || !firstArrayControl) throw 'No control found!';

    const commonStringPath = commonControl.getPath('default');
    expect(commonStringPath.join('.')).toBe([groupField.name, commonField.name].join('.'));

    const commonControlsPath = commonControl.getPath('controls');
    expect(commonControlsPath[0]).toBe(groupControl);
    expect(commonControlsPath[1]).toBe(commonControl);

    const arrayStringPath = firstArrayControl.getPath('default');
    expect(arrayStringPath[0]).toBe(arrayField.name);
    expect(arrayStringPath[2]).toBe(commonControl.name);

    const arrayIndexesPath = firstArrayControl.getPath('indexes');
    expect(arrayIndexesPath[0]).toBe(arrayField.name);
    expect(arrayIndexesPath[1]).toBe(0);
    expect(arrayIndexesPath[2]).toBe(commonControl.name);

    form.cleanup();
  });

  it('#20 Check that addValue, removeValue and toggleValue works', () => {
    const initialValue = ['first', 'second'];
    const form = createMargaritaForm<unknown, MFF>({
      name: nanoid(),
      fields: [
        { ...commonField, initialValue },
        {
          ...uncommonField,
          initialValue: undefined,
        },
      ],
    });

    const commonControl = form.getControl([commonField.name]);
    const uncommonControl = form.getControl([uncommonField.name]);

    if (!commonControl || !Array.isArray(commonControl.value) || !uncommonControl) throw 'No control found!';
    expect(commonControl.value.join('.')).toBe(initialValue.join('.'));
    commonControl.addValue('third');
    expect(commonControl.value.join('.')).toBe([...initialValue, 'third'].join('.'));
    commonControl.removeValue('first');
    expect(commonControl.value.join('.')).toBe(['second', 'third'].join('.'));
    commonControl.toggleValue('second');
    expect(commonControl.value.join('.')).toBe(['third'].join('.'));
    commonControl.toggleValue('second');
    commonControl.toggleValue('first');
    expect(commonControl.value.join('.')).toBe(['third', 'second', 'first'].join('.'));

    expect(uncommonControl.value).toBe(undefined);
    uncommonControl.addValue('first');
    if (!Array.isArray(uncommonControl.value)) throw 'Invalid value!';
    expect(uncommonControl.value.join('.')).toBe(['first'].join('.'));
    uncommonControl.addValue('second');
    expect(uncommonControl.value.join('.')).toBe(['first', 'second'].join('.'));

    form.cleanup();
  });

  it('#21 Check that toggle', () => {
    const form = createMargaritaForm<unknown, MFF>({
      name: nanoid(),
      fields: [commonField, groupField, arrayField, undefinedField],
    });

    const commonControl = form.getControl([commonField.name]);
    const undefinedControl = form.getControl([undefinedField.name]);
    const groupControl = form.getControl([groupField.name]);
    const commonGroupControl = form.getControl([groupField.name, commonField.name]);
    const arrayControl = form.getControl([arrayField.name]);
    const commonArrayControl = form.getControl([arrayField.name, 0, commonField.name]);

    const controls = [
      // All these should have same default state
      form,
      commonControl,
      groupControl,
      commonGroupControl,
      arrayControl,
      commonArrayControl,
    ] as MFC[];

    if (controls.some((c) => c === null)) throw 'No control found!';

    controls.forEach(({ state }) => {
      expect(state.active).toBe(true);
      expect(state.inactive).toBe(false);
      expect(state.valid).toBe(true);
      expect(state.invalid).toBe(false);
      expect(state.pristine).toBe(true);
      expect(state.dirty).toBe(false);
      expect(state.untouched).toBe(true);
      expect(state.touched).toBe(false);
      expect(state.enabled).toBe(true);
      expect(state.disabled).toBe(false);
      expect(state.editable).toBe(true);
      expect(state.readOnly).toBe(false);
      expect(state.hasValue).toBe(true);
      expect(state.shouldShowError).toBe(false);
    });

    // Form root states
    expect(form.state.submitted).toBe(false);
    expect(form.state.submitting).toBe(false);
    expect(form.state.submitResult).toBe('not-submitted');
    expect(form.state.submits).toBe(0);

    // Undefined field state
    if (!undefinedControl) throw 'No control found!';
    expect(undefinedControl.state.hasValue).toBe(false);
    undefinedControl.setValue('Hello world');
    expect(undefinedControl.state.hasValue).toBe(true);
    expect(undefinedControl.state.dirty).toBe(true);
    expect(undefinedControl.state.pristine).toBe(false);

    form.cleanup();
  });
});
