import { debounceTime, firstValueFrom, map } from 'rxjs';
import { MFC, MFF, MargaritaFormField, ControlContext } from '../typings/margarita-form-types';
import { nanoid } from 'nanoid';
import { SubmitError } from '../classes/submit-error';
import { createMargaritaForm } from '../index';
import { I18NExtension } from '../extensions/i18n/i18n-extension';

const fieldNameInitialValue = 'Hello world';
const anotherInitialValue = 'Live long and prosper';

type TestingField = MargaritaFormField<{ value: any; fields: TestingField; name: string }>;

const commonField: TestingField = {
  name: 'fieldName',
  initialValue: fieldNameInitialValue,
};

const undefinedField: TestingField = {
  name: 'undefinedField',
};

const invalidField: TestingField = {
  name: 'invalidField',
  validation: {
    required: true,
    min: 5,
    pattern: /\d\d/g,
    customValidator: true,
    customMax: {
      name: '$$max',
      params: 20,
      errorMessage: 'Value is way way way too high!',
    },
    max: async ({ value }: ControlContext) => {
      if (!value) return { valid: true };
      if (value > 42) return { valid: false, error: 'Value must be under 42!' };
      return { valid: true };
    },
    divisible: async ({ value }: ControlContext) => {
      if (!value) return { valid: true };
      const remainderIsZero = value % 5 === 0;
      if (remainderIsZero) return { valid: true };
      return { valid: false, error: 'Value is not divisible by 5!' };
    },
  },
  validators: {
    pattern: ({ value }: ControlContext) => {
      if (!value) return { valid: true };
      const isPattern = /\d\d/gi.test(String(value));
      if (isPattern) return { valid: true };
      return { valid: false, error: 'Value must have two digits!' };
    },
    customValidator: ({ value }: ControlContext) => {
      if (!value) return { valid: true };
      const isPattern = /\d5/gi.test(String(value));
      if (isPattern) return { valid: true };
      return { valid: false, error: 'Value must end with number 5!' };
    },
  },
};

const uncommonField: TestingField = {
  name: 'anotherOne',
  initialValue: anotherInitialValue,
};

const fromParentValue = fieldNameInitialValue + '-from-parent';
const fromRootValue = fieldNameInitialValue + '-from-root';

const groupField: TestingField = {
  name: 'groupName',
  fields: [commonField],
  initialValue: {
    fieldName: fromParentValue,
  },
};

const asyncGroupField: TestingField = {
  name: 'groupName',
  fields: [{ ...uncommonField, initialValue: undefined, validation: { asyncGroupValidator: true, required: true } }],
  validators: {
    asyncGroupValidator: ({ value, control }: ControlContext) => {
      if (!value) return { valid: true };
      return control.root.valueChanges.pipe(
        map((rootValue) => {
          const sameAsCommon = rootValue?.fieldName === value;
          return { valid: sameAsCommon, error: 'Value is not same as common!' };
        })
      );
    },
  },
};

const uncommonGroupField: TestingField = {
  name: 'groupName',
  fields: [commonField, uncommonField],
  initialValue: {
    fieldName: fromParentValue,
  },
};

const doubleValueField: TestingField = {
  name: 'doubleValue',
  initialValue: 'initialValue',
  defaultValue: 'defaultValue',
};

const onlyDefaultValueField: TestingField = {
  name: 'onlyDefaultValue',
  defaultValue: 'defaultValue',
};

const arrayField: TestingField = {
  name: 'arrayName',
  grouping: 'array',
  fields: [groupField],
};

const flatField: TestingField = {
  name: 'flatName',
  grouping: 'flat',
  fields: [commonField],
};

const withFlatField: TestingField = {
  name: 'withFlatName',
  fields: [flatField],
};

const doubleFlatField: TestingField = {
  name: 'doubleFlatName',
  grouping: 'flat',
  fields: [flatField],
};

const withDoubleFlatField: TestingField = {
  name: 'withDoubleFlatName',
  fields: [doubleFlatField],
};

type ArrayFieldValue = { arrayName: unknown[] };

describe('margaritaForm', () => {
  it('#0-a Common getters', () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [groupField, arrayField, doubleValueField, onlyDefaultValueField, withFlatField, withDoubleFlatField],
    });
    const groupControl = form.getControl([groupField.name]);
    const arrayControl = form.getControl([arrayField.name]);
    const commonControl = form.getControl([groupField.name, commonField.name]);
    const doubleValueControl = form.getControl([doubleValueField.name]);
    const onlyDefaultValueControl = form.getControl([onlyDefaultValueField.name]);
    const withFlatControl = form.getControl([withFlatField.name]);
    const withDoubleFlatControl = form.getControl([withDoubleFlatField.name]);
    if (
      !groupControl ||
      !arrayControl ||
      !commonControl ||
      !doubleValueControl ||
      !onlyDefaultValueControl ||
      !withFlatControl ||
      !withDoubleFlatControl
    )
      throw 'No control found!';
    expect(commonControl.root).toBe(form);
    expect(commonControl.parent).toBe(groupControl);
    expect(commonControl.config).toBe(form.config);
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
    expect(arrayControl.grouping).toBe('array');
    expect(arrayControl.expectArray).toBe(true);
    expect(arrayControl.expectGroup).toBe(false);
    expect(arrayControl.expectChildControls).toBe(true);
    expect(arrayControl.hasControls).toBe(true);
    expect(arrayControl.hasActiveControls).toBe(true);
    expect(arrayControl.controls).toHaveProperty(['0', 'controls', '0', 'name'], commonControl.name);
    expect(arrayControl.activeControls).toHaveProperty(['0', 'controls', '0', 'name'], commonControl.name);
    // Double value and only default value
    expect(doubleValueControl.value).toBe(doubleValueField.initialValue);
    expect(onlyDefaultValueControl.value).toBe(onlyDefaultValueField.defaultValue);
    // Flat testing
    expect(withFlatControl.value).toHaveProperty([commonControl.name], fieldNameInitialValue);
    expect(withDoubleFlatControl.value).toHaveProperty([commonControl.name], fieldNameInitialValue);

    form.cleanup();
  });

  it('#0-b Test flat grouping in 2 levels', () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [withFlatField, withDoubleFlatField],
      initialValue: {
        withFlatName: {
          fieldName: fromRootValue,
        },
        withDoubleFlatName: {
          fieldName: fromRootValue,
        },
      },
    });

    const withFlatControl = form.getControl([withFlatField.name]);
    const withFlatCommonControl = form.getControl([withFlatField.name, flatField.name, commonField.name]);
    const withDoubleFlatControl = form.getControl([withDoubleFlatField.name]);
    const withDoubleFlatCommonControl = form.getControl([withDoubleFlatField.name, doubleFlatField.name, flatField.name, commonField.name]);

    if (!withFlatControl || !withFlatCommonControl || !withDoubleFlatControl || !withDoubleFlatCommonControl) throw 'No control found!';

    expect(withFlatControl.value).toHaveProperty([commonField.name], fromRootValue);
    expect(withFlatCommonControl.value).toBe(fromRootValue);
    expect(withDoubleFlatControl.value).toHaveProperty([commonField.name], fromRootValue);
    expect(withDoubleFlatCommonControl.value).toBe(fromRootValue);
  });

  it('#1 Create single level schema with one field and check initial value', () => {
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [commonField] });
    expect(form.value).toHaveProperty([commonField.name], fieldNameInitialValue);
    form.cleanup();
  });

  it("#2 Create two level schema with one field each and parent's initial value overriding child's value", () => {
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [groupField] });
    expect(form.value).toHaveProperty([groupField.name, commonField.name], fromParentValue);
    form.cleanup();
  });

  it("#3 Create two level schema with one field each and root's initial value overriding all child values", () => {
    const form = createMargaritaForm<MFF>({
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

  it('#4 Create two level schema with first level being an "array". Starting with 1 child.', () => {
    const form = createMargaritaForm<MFF<{ value: ArrayFieldValue }>>({ name: nanoid(), fields: [arrayField] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], fromParentValue);

    form.cleanup();
  });

  it('#5 Create two level schema with first level being an "array". Starting with 0 children.', () => {
    const repeat0 = { ...arrayField, startWith: 0 };
    const form = createMargaritaForm<MFF<{ value: ArrayFieldValue }>>({ name: nanoid(), fields: [repeat0] });
    expect(form.value).not.toHaveProperty([arrayField.name]);
    form.cleanup();
  });

  it('#6 Create two level schema with first level being an "array". Starting with 2 children created with "startWith" property', () => {
    const repeat2 = { ...arrayField, startWith: 2 };
    const form = createMargaritaForm<MFF<{ value: ArrayFieldValue }>>({ name: nanoid(), fields: [repeat2] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], fromParentValue);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], fromParentValue);
    expect(form.value.arrayName).toHaveLength(2);
    form.cleanup();
  });

  it('#7 Create two level schema with first level being an "array". Starting with 3 children created with parent\'s initial value', () => {
    const initialValue = { fieldName: fieldNameInitialValue };
    const initialValueOf3 = { ...arrayField, initialValue: [initialValue, initialValue, initialValue] };
    const form = createMargaritaForm<MFF<{ value: ArrayFieldValue }>>({ name: nanoid(), fields: [initialValueOf3] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], fieldNameInitialValue);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], fieldNameInitialValue);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], fieldNameInitialValue);
    expect(form.value.arrayName).toHaveLength(3);
    form.cleanup();
  });

  it('#8 Create single level schema where root value is set with setValue', () => {
    const value = '#8';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [commonField, uncommonField, groupField] });
    form.setValue({ [commonField.name]: value });
    expect(form.value).toHaveProperty([commonField.name], value);
    expect(form.value).not.toHaveProperty([uncommonField.name]);
    form.cleanup();
  });

  it('#9 Create single level schema where control value is set with setValue', () => {
    const value = '#9';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [commonField] });
    const control = form.getControl(commonField.name);
    control && control.setValue(value);
    expect(form.value).toHaveProperty([commonField.name], value);
    form.cleanup();
  });

  it('#10 Create two level schema where root value is set with setValue', () => {
    const value = '#10';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [groupField] });
    form.setValue({ [groupField.name]: { [commonField.name]: value } });
    expect(form.value).toHaveProperty([groupField.name, commonField.name], value);
    form.cleanup();
  });

  it('#11 Create two level schema where control value is set with setValue', () => {
    const value = '#11';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [groupField] });
    const group = form.getControl(groupField.name);
    const control = group?.getControl(commonField.name);
    control?.setValue(value);
    expect(form.value).toHaveProperty([groupField.name, commonField.name], value);
    expect(control?.value).toBe(value);
    form.cleanup();
  });

  it('#12 Create single level schema where control array value is set with setValue', () => {
    const value = '#12';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [arrayField] });
    form.setValue({ [arrayField.name]: [{ [commonField.name]: value }] });
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], value);
    form.cleanup();
  });

  it('#13 Create single level schema where control array is continued with setValue', () => {
    const value = '#13';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [arrayField] });
    form.setValue({ [arrayField.name]: [{ [commonField.name]: value }, { [commonField.name]: value }] });

    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], value);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], value);
    const control = form.getControl([arrayField.name, 1, commonField.name]);
    expect(control?.value).toBe(value);
    form.cleanup();
  });

  it("#14 Create single level schema where control's value is set from root with patch", () => {
    const value = '#14';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [commonField, uncommonField] });
    form.patchValue({ [commonField.name]: value });
    expect(form.value).toHaveProperty([commonField.name], value);
    expect(form.value).toHaveProperty([uncommonField.name], uncommonField.initialValue);
    form.cleanup();
  });

  it("#15 Create two level schema where control's value is set from root with patch", () => {
    const value = '#15';
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [uncommonGroupField, uncommonField] });
    form.patchValue({ [groupField.name]: { [commonField.name]: value } });
    expect(form.value).toHaveProperty([uncommonField.name], uncommonField.initialValue);
    expect(form.value).toHaveProperty([groupField.name, commonField.name], value);
    expect(form.value).not.toHaveProperty([groupField.name, uncommonField.name]);
    form.cleanup();
  });

  it('#16 Create new controls programatically', async () => {
    const form = createMargaritaForm<MFF>({ name: nanoid(), fields: [] });
    const changes = form.changes.pipe(debounceTime(100));

    form.addControl(commonField);
    form.addControl(undefinedField);
    form.addControl({ ...arrayField, startWith: 3 });

    expect(form.value).toHaveProperty([commonField.name], commonField.initialValue);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], fromParentValue);
    expect(form.value).not.toHaveProperty([undefinedField.name]);

    form.getOrAddControl({ ...commonField, initialValue: 'Should not be this value!' });
    expect(form.value).toHaveProperty([commonField.name], commonField.initialValue);
    form.getOrAddControl({ ...commonField, name: 'actuallyNewControl', initialValue: 'actually new value' });
    expect(form.value).toHaveProperty(['actuallyNewControl'], 'actually new value');

    expect(form.state.valid).toBe(true);
    form.getOrAddControl({ ...commonField, name: 'newAndInvalidControl', initialValue: undefined, validation: { required: true } });
    expect(form.value).not.toHaveProperty(['newAndInvalidControl']);
    await firstValueFrom(changes);
    expect(form.state.valid).toBe(false);
    const newAndInvalidControl = form.getControl('newAndInvalidControl');
    if (!newAndInvalidControl) throw 'No control found!';
    newAndInvalidControl.setValue('valid-value');
    await firstValueFrom(changes);
    expect(form.state.valid).toBe(true);

    const arrayControl = form.getControl(arrayField.name);
    if (!arrayControl || !Array.isArray(arrayControl.value)) throw 'No array control found!';
    expect(form.value).not.toHaveProperty([arrayField.name, '3']);
    expect(form.value).not.toHaveProperty([arrayField.name, '4']);
    arrayControl.appendControl();
    expect(form.value).toHaveProperty([arrayField.name, '3', commonField.name], fromParentValue);
    expect(form.value).not.toHaveProperty([arrayField.name, '4']);
    arrayControl.appendControl();
    arrayControl.appendControl();
    arrayControl.appendControl();
    arrayControl.appendControl();
    expect(form.value).toHaveProperty([arrayField.name, '4', commonField.name], fromParentValue);

    form.cleanup();
  });

  it('#17 Remove new controls programatically', () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [commonField, uncommonField, { ...arrayField, startWith: 3 }],
    });

    expect(form.value).toHaveProperty([commonField.name], commonField.initialValue);
    form.removeControl(commonField.name);
    expect(form.value).not.toHaveProperty([commonField.name]);
    const arr = form.getControl(arrayField.name);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], fromParentValue);
    if (arr) {
      arr.removeControl(0);
      expect(form.value).not.toHaveProperty([arrayField.name, '2']);
    }
    form.cleanup();
  });

  it('#18 Reorder (move) new controls programatically', () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [{ ...arrayField, startWith: 3 }],
    });

    const arrayControl = form.getControl([arrayField.name]);
    const firstArrayGroup = form.getControl([arrayField.name, 0]);
    const firstArrayControl = form.getControl([arrayField.name, 0, commonField.name]);
    const thirdArrayControl = form.getControl([arrayField.name, 2, commonField.name]);
    const initiallyLastArrayControl = form.getControl([arrayField.name, 2, commonField.name]);

    if (!arrayControl || !firstArrayGroup || !firstArrayControl || !thirdArrayControl) throw 'No control found!';
    expect(thirdArrayControl).toBe(initiallyLastArrayControl);

    const value = 'first!';
    firstArrayControl.setValue(value);
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], value);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], fromParentValue);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], fromParentValue);

    firstArrayGroup.moveToIndex(2);
    expect(form.value).toHaveProperty([arrayField.name, '0', commonField.name], fromParentValue);
    expect(form.value).toHaveProperty([arrayField.name, '1', commonField.name], fromParentValue);
    expect(form.value).toHaveProperty([arrayField.name, '2', commonField.name], value);

    const finallyLastArrayControl = form.getControl([arrayField.name, 2, commonField.name]);
    expect(thirdArrayControl).not.toBe(finallyLastArrayControl);
    expect(firstArrayControl).toBe(finallyLastArrayControl);

    form.cleanup();
  });

  it('#19 Check that paths work as should', () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [commonField, groupField, { ...arrayField, startWith: 3 }],
    });

    const groupControl = form.getControl([groupField.name]);
    const commonControl = form.getControl([groupField.name, commonField.name]);
    const arrayControl = form.getControl([arrayField.name]);
    const firstArrayControl = form.getControl([arrayField.name, 0, commonField.name]);

    if (!groupControl || !commonControl || !arrayControl || !firstArrayControl) throw 'No control found!';

    const commonStringPath = commonControl.getPath('default');
    expect(commonStringPath.join('.')).toBe([form.name, groupField.name, commonField.name].join('.'));

    const commonControlsPath = commonControl.getPath('controls');
    expect(commonControlsPath[1]).toBe(groupControl);
    expect(commonControlsPath[2]).toBe(commonControl);

    const arrayStringPath = firstArrayControl.getPath('default');

    expect(arrayStringPath[1]).toBe(arrayField.name);
    expect(arrayStringPath[2]).toBe(`0:${groupControl.name}`);
    expect(arrayStringPath[3]).toBe(commonControl.name);

    form.cleanup();
  });

  it('#20 Check that addValue, removeValue and toggleValue works', () => {
    const initialValue = ['first', 'second'];
    const form = createMargaritaForm<MFF>({
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

  it('#21 Check that default states are what they should be', () => {
    const form = createMargaritaForm<MFF>({
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

  it('#21-B Check that state methods work', async () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [commonField, groupField],
    });

    const commonControl = form.getControl([commonField.name]);
    const groupControl = form.getControl([groupField.name]);
    const commonGroupControl = form.getControl([groupField.name, commonField.name]);

    const controls = [
      // All these should have same default state
      form,
      commonControl,
      groupControl,
      commonGroupControl,
    ] as MFC[];

    if (controls.some((c) => c === null)) throw 'No control found!';

    controls.forEach(({ state }) => {
      expect(state.enabled).toBe(true);
      expect(state.disabled).toBe(false);
    });

    form.disable();
    await new Promise((resolve) => setTimeout(resolve, 10));

    controls.forEach(({ state }) => {
      expect(state.enabled).toBe(false);
      expect(state.disabled).toBe(true);
    });

    form.cleanup();
  });

  it('#21-C Check that dirty state gets updated correctly', async () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [commonField, groupField, arrayField],
    });
    const observable = form.changes.pipe(debounceTime(50));
    const commonFieldControl = form.getControl([commonField.name]);
    const groupFieldControl = form.getControl([groupField.name]);
    const arrayFieldControl = form.getControl([arrayField.name]);

    if (!commonFieldControl) throw 'No control found!';
    if (!groupFieldControl) throw 'No control found!';
    if (!arrayFieldControl) throw 'No control found!';

    const groupFieldCommonFieldControl = form.getControl([groupField.name, commonField.name]);
    if (!groupFieldCommonFieldControl) throw 'No control found!';

    const arrayFieldCommonFieldFirstControl = form.getControl([arrayField.name, 0]);
    if (!arrayFieldCommonFieldFirstControl) throw 'No control found!';

    expect(form.state.dirty).toBe(false);
    expect(form.state.pristine).toBe(true);
    expect(commonFieldControl.state.dirty).toBe(false);
    expect(commonFieldControl.state.pristine).toBe(true);
    expect(groupFieldControl.state.dirty).toBe(false);
    expect(groupFieldControl.state.pristine).toBe(true);
    expect(arrayFieldControl.state.dirty).toBe(false);
    expect(arrayFieldControl.state.pristine).toBe(true);
    expect(groupFieldCommonFieldControl.state.dirty).toBe(false);
    expect(groupFieldCommonFieldControl.state.pristine).toBe(true);
    expect(arrayFieldCommonFieldFirstControl.state.dirty).toBe(false);
    expect(arrayFieldCommonFieldFirstControl.state.pristine).toBe(true);

    // Update common field control
    commonFieldControl.setValue('Hello world!!!');
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);
    expect(commonFieldControl.state.dirty).toBe(true);
    expect(commonFieldControl.state.pristine).toBe(false);
    expect(groupFieldControl.state.dirty).toBe(false);
    expect(groupFieldControl.state.pristine).toBe(true);
    expect(arrayFieldControl.state.dirty).toBe(false);
    expect(arrayFieldControl.state.pristine).toBe(true);

    // Update group field's common field control
    groupFieldCommonFieldControl.setValue('Hello world!!!');
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);
    expect(groupFieldControl.state.dirty).toBe(true);
    expect(groupFieldControl.state.pristine).toBe(false);
    expect(groupFieldCommonFieldControl.state.dirty).toBe(true);
    expect(groupFieldCommonFieldControl.state.pristine).toBe(false);

    // Update array field's common field control
    arrayFieldCommonFieldFirstControl.setValue({ [commonField.name]: 'Hello world!!!' });
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);
    expect(arrayFieldControl.state.dirty).toBe(true);
    expect(arrayFieldControl.state.pristine).toBe(false);
    expect(arrayFieldCommonFieldFirstControl.state.dirty).toBe(true);
    expect(arrayFieldCommonFieldFirstControl.state.pristine).toBe(false);

    form.resetState();
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(false);
    expect(form.state.pristine).toBe(true);
    expect(commonFieldControl.state.dirty).toBe(false);
    expect(commonFieldControl.state.pristine).toBe(true);
    expect(groupFieldControl.state.dirty).toBe(false);
    expect(groupFieldControl.state.pristine).toBe(true);
    expect(arrayFieldControl.state.dirty).toBe(false);
    expect(arrayFieldControl.state.pristine).toBe(true);
    expect(groupFieldCommonFieldControl.state.dirty).toBe(false);
    expect(groupFieldCommonFieldControl.state.pristine).toBe(true);
    expect(arrayFieldCommonFieldFirstControl.state.dirty).toBe(false);
    expect(arrayFieldCommonFieldFirstControl.state.pristine).toBe(true);

    groupFieldCommonFieldControl.setValue('Hello world!!!!!', false);
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(false);
    expect(form.state.pristine).toBe(true);
    expect(groupFieldControl.state.dirty).toBe(false);
    expect(groupFieldControl.state.pristine).toBe(true);
    expect(groupFieldCommonFieldControl.state.dirty).toBe(false);
    expect(groupFieldCommonFieldControl.state.pristine).toBe(true);

    arrayFieldControl.appendControl('groupName');
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);
    expect(arrayFieldControl.value).toHaveLength(2);
    expect(arrayFieldCommonFieldFirstControl.index).toBe(0);

    form.resetState();
    await firstValueFrom(observable);

    arrayFieldCommonFieldFirstControl.moveToIndex(1);
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);
    expect(arrayFieldControl.value).toHaveLength(2);
    expect(arrayFieldCommonFieldFirstControl.index).toBe(1);

    form.resetState();
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(false);
    expect(form.state.pristine).toBe(true);

    arrayFieldControl.removeControl(0);
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);

    form.resetState();
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(false);
    expect(form.state.pristine).toBe(true);
    expect(arrayFieldCommonFieldFirstControl.state.dirty).toBe(false);
    expect(arrayFieldCommonFieldFirstControl.state.pristine).toBe(true);

    form.patchValue({
      [commonField.name]: 'Hello world?',
    });
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);
    expect(commonFieldControl.state.dirty).toBe(true);
    expect(commonFieldControl.state.pristine).toBe(false);
    expect(groupFieldControl.state.dirty).toBe(false);
    expect(groupFieldControl.state.pristine).toBe(true);

    form.patchValue({
      [groupField.name]: {
        [commonField.name]: 'Hello world?',
      },
    });
    await firstValueFrom(observable);

    expect(groupFieldControl.state.dirty).toBe(true);
    expect(groupFieldControl.state.pristine).toBe(false);
    expect(groupFieldCommonFieldControl.state.dirty).toBe(true);
    expect(groupFieldCommonFieldControl.state.pristine).toBe(false);

    expect(arrayFieldControl.state.dirty).toBe(false);
    expect(arrayFieldControl.state.pristine).toBe(true);
    expect(arrayFieldCommonFieldFirstControl.state.dirty).toBe(false);
    expect(arrayFieldCommonFieldFirstControl.state.pristine).toBe(true);

    form.resetState();
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(false);
    expect(form.state.pristine).toBe(true);

    form.setValue({
      [commonField.name]: 'Hello world???',
    });
    await firstValueFrom(observable);

    expect(form.state.dirty).toBe(true);
    expect(form.state.pristine).toBe(false);
    expect(commonFieldControl.state.dirty).toBe(true);
    expect(commonFieldControl.state.pristine).toBe(false);
    expect(groupFieldControl.state.dirty).toBe(true);
    expect(groupFieldControl.state.pristine).toBe(false);
    expect(arrayFieldControl.state.dirty).toBe(true);
    expect(arrayFieldControl.state.pristine).toBe(false);
    expect(form.value.arrayName).toBe(undefined);
    expect(arrayFieldControl.value).toBe(undefined); // TODO: check if it makes sense to allow arrays with length 0 (expect(arrayFieldControl.value).toHaveLength(0))

    form.cleanup();
  });

  it('#22 Check basic validators', async () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [invalidField],
    });

    const invalidControl = form.getControl([invalidField.name]);
    if (!invalidControl) throw 'No control found!';
    const { state, stateChanges } = invalidControl;
    expect(state.valid).toBe(false);

    const observable = stateChanges.pipe(debounceTime(10));

    await firstValueFrom(observable);
    expect(state.valid).toBe(false);
    expect(state.errors['required']).toBe('This field is required!');

    invalidControl.setValue(10);
    await firstValueFrom(observable);
    expect(state.valid).toBe(false);

    invalidControl.setValue(1);
    await firstValueFrom(observable);
    expect(state.valid).toBe(false);
    expect(state.errors['min']).toBe('Value is too low!');
    expect(state.errors['pattern']).toBe('Value must have two digits!');
    expect(state.errors['divisible']).toBe('Value is not divisible by 5!');
    expect(state.errors['customValidator']).toBe('Value must end with number 5!');

    invalidControl.setValue(25);
    await firstValueFrom(observable);
    expect(state.valid).toBe(false);
    expect(state.errors['customMax']).toBe('Value is way way way too high!');
    expect(state.errors['max']).toBe(undefined);

    invalidControl.setValue(55);
    await firstValueFrom(observable);
    expect(state.valid).toBe(false);
    expect(state.errors['max']).toBe('Value must be under 42!');

    invalidControl.setValue(19);
    await firstValueFrom(observable);
    expect(state.valid).toBe(false);
    expect(state.errors['divisible']).toBe('Value is not divisible by 5!');
    expect(state.errors['customValidator']).toBe('Value must end with number 5!');

    invalidControl.setValue(15);
    await firstValueFrom(observable);
    expect(state.valid).toBe(true);

    form.cleanup();
  });

  it('#23 Check advanced validators', async () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [commonField, asyncGroupField],
    });

    const uncommonControl = form.getControl([asyncGroupField.name, uncommonField.name]);
    if (!uncommonControl) throw 'No control found!';
    const { state, stateChanges } = uncommonControl;
    expect(state.valid).toBe(false);

    const observable = stateChanges.pipe(debounceTime(10));

    await firstValueFrom(observable);
    expect(state.valid).toBe(false);

    expect(state.errors['required']).toBe('This field is required!');

    uncommonControl.setValue('just something');
    await firstValueFrom(observable);
    expect(state.valid).toBe(false);
    expect(state.errors['asyncGroupValidator']).toBe('Value is not same as common!');

    uncommonControl.setValue(commonField.initialValue);
    await firstValueFrom(observable);
    expect(state.valid).toBe(true);

    form.cleanup();
  });

  it('#24 Check that validate works', async () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [{ ...commonField, validation: { required: true } }],
    });

    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(commonControl.state.valid).toBe(true); // Required validator initially syncronously returns true
    commonControl.setValue(undefined, false, false);
    expect(commonControl.state.valid).toBe(true); // Required validator is not yet updated
    const response1 = await commonControl.validate();
    expect(response1).toBe(false);
    expect(commonControl.state.valid).toBe(false);
    commonControl.setValue(commonField.initialValue, false, false);
    expect(commonControl.state.valid).toBe(false);
    const response2 = await commonControl.validate();
    expect(response2).toBe(true);
    expect(commonControl.state.valid).toBe(true);

    form.cleanup();
  });

  it('#25-A Check that form submit works correctly', async () => {
    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [{ ...commonField, initialValue: undefined, validation: { required: true } }],
      handleSubmit: {
        valid: async (context) => {
          if (context.value[commonField.name] === 'submit-error') return new SubmitError('test-error', 'test-error-data');
          if (context.value[commonField.name] === commonField.initialValue) return 'valid';
          throw 'error';
        },
        invalid: async () => 'invalid',
      },
    });

    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(0);
    expect(form.state.submitResult).toBe('not-submitted');
    expect(form.state.submitted).toBe(false);
    expect(form.state.disabled).toBe(false);

    const submitResult1 = await form.submit();
    expect(submitResult1).toBe('invalid');

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(1);
    expect(form.state.submitResult).toBe('form-invalid');
    expect(form.state.submitted).toBe(true);
    expect(form.state.disabled).toBe(false);

    commonControl.setValue('not-valid-value-for-submit');

    const submitResult2 = await form.submit();
    expect(submitResult2).toBe('error');

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(2);
    expect(form.state.submitResult).toBe('error');
    expect(form.state.submitted).toBe(true);
    expect(form.state.disabled).toBe(false);

    commonControl.setValue('submit-error');

    const submitResult3 = await form.submit();
    expect(submitResult3).toBe('test-error-data');

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(3);
    expect(form.state.submitResult).toBe('error');
    expect(form.state.submitted).toBe(true);
    expect(form.state.disabled).toBe(false);

    commonControl.setValue(commonField.initialValue);

    const submitResult4 = await form.submit();
    expect(submitResult4).toBe('valid');

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(4);
    expect(form.state.submitResult).toBe('success');
    expect(form.state.submitted).toBe(true);
    expect(form.state.disabled).toBe(true);

    form.cleanup();
  });

  it('#28 Check for TypeScript errors', () => {
    interface CustomField extends MFF<{ value: string }> {
      type: 'custom';
      lorem?: 'ipsum';
      maybe?: boolean;
    }
    interface OtherCustomField extends MFF<{ value: number }> {
      type: 'joku-muu';
      lorem?: 'ipsum';
      maybe?: boolean;
    }

    type ChildField = CustomField | OtherCustomField;

    interface RootField extends MFF<{ value: CustomValue; fields: ChildField }> {
      type: 'root';
      fields: ChildField[];
    }

    interface CustomValue {
      typedField: 'Hello world!';
    }

    const typedField: CustomField = {
      name: 'typedField',
      type: 'custom',
      lorem: 'ipsum',
      maybe: false,
    };

    const form = createMargaritaForm<RootField>({
      name: nanoid(),
      type: 'root',
      fields: [typedField],
    });

    const typedControl = form.getControl('typedField');
    if (!typedControl) throw 'No control found!';
    expect(typedControl.field.type).toBe('custom');

    const typedControl2 = form.getControl<CustomField>([typedField.name]);
    if (!typedControl2) throw 'No control found!';
    expect(typedControl2.field.type).toBe('custom');
    expect(typedControl2.field.lorem).toBe('ipsum');
    expect(typedControl2.field.maybe).toBe(false);

    typedControl.updateField({ maybe: true });
    form.setValue({ typedField: 'Hello world!' });
    expect(form.value.typedField).toBe('Hello world!');

    form.cleanup();
  });

  it('#29 Test config overrides', () => {
    const form = createMargaritaForm<MFF<{ value: any; fields: MFF }>>({
      name: nanoid(),
      fields: [
        {
          name: 'configTest',
          config: {
            addMetadata: false,
          },
        },
      ],
      config: {
        addMetadata: true,
        allowEmptyString: true,
      },
    });

    const configTestControl = form.getControl(['configTest']);
    if (!configTestControl) throw 'No control found!';

    expect(form.config.addMetadata).toBe(true);
    expect(configTestControl.config.addMetadata).toBe(false);
    expect(configTestControl.config.allowEmptyString).toBe(true);
    form.cleanup();
  });

  it('#29 Check that CMS like forms work', async () => {
    const cmsData: MFF<{ value: any; fields: MFF }> = {
      name: nanoid(),
      handleSubmit: '$$handleSubmitResolver',
      fields: [
        {
          name: 'cmsField1',
          active: '$$activeResolver',
          validation: {
            required: true,
            customValidator: true,
          },
          params: {
            customParam: '$$customParamResolver',
          },
          i18n: {
            title: {
              en: 'CMS Field 1',
              fi: 'CMS Kenttä 1',
            },
          },
        },
        {
          name: 'cmsField2',
          valueResolver: '$$cmsField2Value',
        },
      ],
    };

    const form = createMargaritaForm<MFF<{ value: any; fields: MFF }>>({
      ...cmsData,
      currentLocale: 'fi',
      extensions: [I18NExtension],
      validators: {
        customValidator: ({ value }) => {
          // console.log('Custom validator called!');
          if (value === 'invalid') return { valid: false, error: 'Invalid value!' };
          return { valid: true };
        },
      },
      resolvers: {
        activeResolver: () => {
          // console.log('Active resolver called!');
          return false;
        },
        customParamResolver: () => {
          // console.log('Custom param resolver called!');
          return 'custom-param-value';
        },
        handleSubmitResolver: async (form) => {
          // console.log('Handle submit resolver called!');
          if (form.value.cmsField1 === 'invalid') throw 'form-submit-error';
          return 'works';
        },
        cmsField2Value: async () => {
          // console.log('CMS field 2 value resolver called!');
          await new Promise((resolve) => setTimeout(resolve, 125));
          return 'cms-field-2-value';
        },
      },
    });

    const cmsField1Control = form.getControl(['cmsField1']);
    const cmsField2Control = form.getControl(['cmsField2']);
    if (!cmsField1Control || !cmsField2Control) throw 'No control found!';

    expect(cmsField2Control.value).toBe(undefined); // Value resolver takes 125ms to resolve
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(cmsField1Control.i18n.title).toBe('CMS Kenttä 1');
    expect(cmsField1Control.state.active).toBe(false);
    expect(cmsField1Control.params['customParam']).toBe('custom-param-value');
    expect(cmsField1Control.state.valid).toBe(false);
    expect(cmsField1Control.state.errors['required']).toBe('This field is required!');
    expect(cmsField1Control.state.errors['customValidator']).toBe(undefined);
    expect(cmsField2Control.value).toBe(undefined);

    cmsField1Control.setValue('invalid');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(cmsField1Control.state.valid).toBe(false);
    expect(cmsField1Control.state.errors['required']).toBe(undefined);
    expect(cmsField1Control.state.errors['customValidator']).toBe('Invalid value!');

    cmsField1Control.setValue('valid');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(cmsField1Control.state.valid).toBe(true);
    expect(cmsField1Control.state.errors['required']).toBe(undefined);
    expect(cmsField1Control.state.errors['customValidator']).toBe(undefined);
    expect(cmsField2Control.value).toBe('cms-field-2-value');

    const submitResult = await form.submit();
    expect(submitResult).toBe('works');

    form.cleanup();
  });

  it('#30 Check that name and fields are valid', async () => {
    try {
      createMargaritaForm({
        name: '',
      });
    } catch (error) {
      expect(error).toBe('Missing name in field: root');
    }

    try {
      createMargaritaForm({
        name: 'root',
        fields: [
          {
            name: '',
          },
        ],
      });
    } catch (error) {
      expect(error).toBe('Missing name in field: root > *');
    }

    try {
      createMargaritaForm({
        name: 'root',
        fields: {} as any,
      });
    } catch (error) {
      expect(error).toBe('Invalid fields provided for field at: root');
    }
  });

  it('#31-a Check that resets and clears work as should', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        {
          name: 'text',
          initialValue: 'text',
        },
        {
          name: 'object',
          initialValue: {
            childValue: 'childValue',
          },
        },
        {
          name: 'inactive',
          initialValue: 'not-active',
          active: false,
          validation: {
            justInvalid: () => ({ valid: false, error: 'Always be invalid' }),
          },
        },
      ],
    });

    const inactiveControl = form.getControl(['inactive']);
    const objectControl = form.getControl(['object']);
    if (!objectControl || !inactiveControl) throw 'No control found!';

    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.value).toHaveProperty(['object', 'childValue'], 'childValue');
    expect(form.value).not.toHaveProperty(['inactive']);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(form.state.valid).toBe(true);
    expect(inactiveControl.state.valid).toBe(false);

    form.clearValue();

    expect(form.value).not.toHaveProperty(['text']);
    expect(form.value).not.toHaveProperty(['object']);
    expect(form.value).not.toHaveProperty(['inactive']);

    form.resetValue(true);

    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.value).toHaveProperty(['object', 'childValue'], 'childValue');
    expect(form.value).not.toHaveProperty(['inactive']);

    expect(form.state.dirty).toBe(true);
    expect(objectControl.state.dirty).toBe(true);

    form.resetValue(undefined);

    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.value).toHaveProperty(['object', 'childValue'], 'childValue');
    expect(form.value).not.toHaveProperty(['inactive']);

    expect(form.state.dirty).toBe(true);
    expect(objectControl.state.dirty).toBe(true);

    form.resetValue(false);

    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.value).toHaveProperty(['object', 'childValue'], 'childValue');
    expect(form.value).not.toHaveProperty(['inactive']);

    expect(form.state.dirty).toBe(false);
    expect(objectControl.state.dirty).toBe(false);

    form.resetValue(true);
    expect(form.state.dirty).toBe(true);
    expect(objectControl.state.dirty).toBe(true);
    expect(form.value).not.toHaveProperty(['inactive']);

    form.resetState();
    expect(form.state.dirty).toBe(false);
    expect(objectControl.state.dirty).toBe(false);
    expect(form.value).not.toHaveProperty(['inactive']);

    form.setValue({});
    expect(form.state.dirty).toBe(true);
    expect(form.value).not.toHaveProperty(['text']);
    expect(form.value).not.toHaveProperty(['object']);
    expect(form.value).not.toHaveProperty(['inactive']);

    form.clear();
    expect(form.state.dirty).toBe(false);
    expect(form.value).not.toHaveProperty(['text']);
    expect(form.value).not.toHaveProperty(['object']);
    expect(form.value).not.toHaveProperty(['inactive']);

    form.setValue({});
    expect(form.state.dirty).toBe(true);
    expect(form.value).not.toHaveProperty(['text']);
    expect(form.value).not.toHaveProperty(['object']);
    expect(form.value).not.toHaveProperty(['inactive']);

    form.reset();
    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.value).toHaveProperty(['object', 'childValue'], 'childValue');
    expect(form.value).not.toHaveProperty(['inactive']);

    expect(form.state.dirty).toBe(false);
    expect(objectControl.state.dirty).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(form.state.valid).toBe(true);
    expect(inactiveControl.state.valid).toBe(false);

    form.cleanup();
  });

  it('#31-b Check that resets and clears work as should', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: {
        text: 'text',
        object: {
          childValue: 'childValue',
        },
      },
      fields: [
        {
          name: 'text',
          initialValue: 'wrong-text',
        },
        {
          name: 'inactive',
          initialValue: 'not-active',
          active: false,
        },
      ],
    });

    const textControl = form.getControl(['text']);
    const inactiveControl = form.getControl(['inactive']);
    if (!textControl || !inactiveControl) throw 'No control found!';

    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.value).not.toHaveProperty(['inactive']);
    form.resetValue(true);

    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.state.dirty).toBe(true);
    expect(textControl.state.dirty).toBe(true);
    expect(inactiveControl.state.dirty).toBe(true);

    textControl.resetValue();

    expect(textControl.value).toBe('text');
    expect(textControl.state.dirty).toBe(true);
    expect(inactiveControl.state.dirty).toBe(true);

    form.resetValue(false);

    expect(form.value).toHaveProperty(['text'], 'text');
    expect(form.value).not.toHaveProperty(['inactive']);
    expect(inactiveControl.state.dirty).toBe(false);

    form.cleanup();
  });
});
