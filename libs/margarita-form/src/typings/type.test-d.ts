/* eslint-disable @typescript-eslint/no-unused-vars */
import { expectType, expectNotType, expectAssignable } from 'tsd';
import { FieldChild, FieldParams, MFC, MFCA, MFF, MFGF, WithValue, createMargaritaForm } from '../index';

declare module './expandable-types' {
  export interface ControlBase<FIELD extends MFF> {
    newMethod2(): void;
  }
}

const vanillaForm = createMargaritaForm<MFF>({
  name: 'form-0',
  handleSubmit: ({ control, value }) => {
    expectType<MFC<MFGF<{ value: any }>>>(control);
    expectType<any>(value);
  },
  validation: {
    custom: (context) => {
      expectType<MFC<MFGF<{ value: any }>>>(context.control);
      expectType<any>(context.value);
    },
  },
  fields: [
    {
      name: 'level-1',
      fields: [
        {
          name: 'level-2',
          fields: [
            {
              name: 'level-3',
              fields: [
                {
                  name: 'level-4',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

type VanillaFieldType = MFC<MFGF<FieldParams> & WithValue<any>>;

expectType<MFF>(vanillaForm.field);
const level1Control = vanillaForm.getControl('level-1');
if (!level1Control) throw new Error('Control not found');
expectType<VanillaFieldType>(level1Control);
const level2Control = level1Control.getControl('level-2');
if (!level2Control) throw new Error('Control not found');
expectType<VanillaFieldType>(level2Control);
const level3Control = level2Control.getControl('level-3');
if (!level3Control) throw new Error('Control not found');
expectType<VanillaFieldType>(level3Control);
const level4Control = level3Control.getControl('level-4');
if (!level4Control) throw new Error('Control not found');
expectType<VanillaFieldType>(level4Control);

expectType<() => void>(vanillaForm.newMethod2);

interface Address {
  street: string;
  city: string;
}

interface Person {
  name: string;
  age: number;
  address: Address;
  emailAddresses: string[];
}

interface CustomFieldBase<Type, Value, Field extends MFF = never> extends MFF<{ value: Value; fields: Field }> {
  title: string;
  type: Type;
}

type StringField = CustomFieldBase<'text' | 'email', string>;
type NumberField = CustomFieldBase<'number', number>;
type AddressField = CustomFieldBase<'address', Address, StringField>;
type StringArrayField = CustomFieldBase<'array', string[], StringField>;
type PersonChildFields = StringField | NumberField | AddressField | StringArrayField;
type PersonField = MFF<{ value: Person; fields: PersonChildFields }>;

const form = createMargaritaForm<PersonField>({
  name: 'form-1',
  handleSubmit: ({ control, value }) => {
    expectType<MFC<MFGF<{ value: Person }>>>(control);
    expectType<Person | undefined>(value);
  },
  validation: {
    custom: (context) => {
      expectType<MFC<MFGF<{ value: Person }>>>(context.control);
      expectType<Person | undefined>(context.value);
    },
  },
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'text',
    },
    {
      name: 'age',
      title: 'Age',
      type: 'number',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'address',
      startWith: 1,
      fields: [
        {
          name: 'street',
          title: 'Street',
          type: 'text',
        },
        {
          name: 'city',
          title: 'City',
          type: 'text',
        },
      ],
    },
    {
      name: 'emailAddresses',
      title: 'Email addresses',
      type: 'array',
      fields: [
        {
          name: 'emailAddress',
          title: 'Email address',
          type: 'email',
          validation: {
            custom: (context) => {
              expectType<MFC<MFGF<{ value: string }>>>(context.control);
              expectType<string | undefined>(context.value);
              return { valid: true };
            },
          },
        },
      ],
    },
  ],
});

expectType<PersonField>(form.field);
expectType<Person>(form.value);
const controls = form.controls;
type ChildControls = MFCA<PersonChildFields>;
expectType<ChildControls>(controls);
const nameControl = form.getControl('name');
expectType<StringField>(nameControl.field);
expectType<string>(nameControl.value);
expectType<MFCA<never>>(nameControl.controls);
const ageControl = form.getControl('age');
expectType<NumberField>(ageControl.field);
expectType<number>(ageControl.value);
expectType<MFCA<never>>(ageControl.controls);
const addressControl = form.getControl('address');
expectType<AddressField>(addressControl.field);
expectType<Address>(addressControl.value);
expectType<MFCA<StringField>>(addressControl.controls);
const streetControl = addressControl.getControl('street');
expectType<StringField>(streetControl.field);
expectType<string>(streetControl.value);
expectType<MFCA<never>>(streetControl.controls);
const emailAddressesControl = form.getControl('emailAddresses');
expectType<StringArrayField>(emailAddressesControl.field);
expectType<string[]>(emailAddressesControl.value);
expectType<MFCA<StringField>>(emailAddressesControl.controls);
const emailAddressControl = emailAddressesControl.getControl(0);
expectType<MFC<StringField> | undefined>(emailAddressControl);
if (emailAddressControl) {
  expectType<StringField>(emailAddressControl.field);
  expectType<string>(emailAddressControl.value);
  expectType<MFCA<never>>(emailAddressControl.controls);
}

const kindaUnknownControl = form.getControl(['address', 'street']);
expectType<MFC<PersonChildFields>>(kindaUnknownControl);

type StringControl = MFC<StringField>;

const fieldSpecifiedControl = form.getControl<StringField>(['address', 'street']);
expectType<StringControl>(fieldSpecifiedControl);

const controlSpecifiedControl = form.getControl<StringControl>(['address', 'street']);
expectType<StringControl>(controlSpecifiedControl);

// Advanced usage

interface FieldBase<V = unknown, F extends MFF = never> extends MFF<{ value: V; fields: F }> {
  title: string;
}

interface AdvStringField extends FieldBase<string> {
  type: 'text';
}

interface AdvNumberField extends FieldBase<number> {
  type: 'number';
  min: number;
}

interface AdvOptionsField extends FieldBase<string> {
  type: 'options';
  options: string[];
}

interface AdvPreNamedField extends FieldBase<string> {
  name: 'advPreNamedField';
  type: 'static';
}

interface AdvGroupField extends FieldBase<object, AdvField> {
  type: 'group';
}

type AdvField = AdvStringField | AdvNumberField | AdvOptionsField | AdvGroupField | AdvPreNamedField;

interface AdvFormValue {
  advStringField: string;
  advNumberField: number;
  advOptionsField: string;
  advPreNamedField: string;
}

interface AdvRootField extends FieldBase<AdvFormValue, AdvField> {
  name: 'advRootField';
}

const advField: AdvRootField = {
  name: 'advRootField',
  title: 'Adv field',
  fields: [
    {
      name: 'advStringField',
      title: 'Adv string field',
      type: 'text',
    },
    {
      name: 'advNumberField',
      title: 'Adv number field',
      type: 'number',
      min: 0,
    },
    {
      name: 'advOptionsField',
      title: 'Adv options field',
      type: 'options',
      options: ['a', 'b', 'c'],
    },
  ],
};

expectType<AdvRootField>(advField);
expectNotType<AdvField>(advField.fields![0]);
expectType<FieldChild<AdvField>>(advField.fields![0]);

const advForm = createMargaritaForm<AdvRootField>(advField);

expectType<AdvRootField>(advForm.field);
expectType<MFC<AdvField>[]>(advForm.controls);
expectType<MFC<AdvField>[]>(advForm.activeControls);

const advStringFieldControl = advForm.getControl('advStringField');
if (advStringFieldControl) {
  expectType<AdvStringField | AdvOptionsField | AdvPreNamedField>(advStringFieldControl.field);
  expectType<string>(advStringFieldControl.value);
}

const advNumberFieldControl = advForm.getControl('advNumberField');
if (advNumberFieldControl) {
  expectType<AdvNumberField>(advNumberFieldControl.field);
  expectType<number>(advNumberFieldControl.value);
}

const advOptionsFieldControl = advForm.getControl<AdvOptionsField>('advOptionsField');
if (advOptionsFieldControl) {
  expectType<AdvOptionsField>(advOptionsFieldControl.field);
  expectType<string>(advOptionsFieldControl.value);
}

const advPreNamedFieldControl = advForm.getControl('advPreNamedField');
if (advPreNamedFieldControl) {
  expectType<AdvPreNamedField>(advPreNamedFieldControl.field);
  expectType<string>(advPreNamedFieldControl.value);
}

advForm.activeControls.map((control) => {
  expectType<MFC<AdvField>>(control);
  const { field } = control;

  if (field.type === 'options') {
    expectType<AdvOptionsField>(field);
  }

  function isAdvOptionsField(field: AdvField): field is AdvOptionsField {
    return 'options' in field;
  }

  if (isAdvOptionsField(field)) {
    expectType<AdvOptionsField>(field);
  }

  if ('options' in field) {
    expectType<AdvOptionsField>(field);
  }
});

interface FormValue {
  name: string;
  age: number;
}

type ValueFormRootField = MFF<{ value: FormValue }>;

const valueForm = createMargaritaForm<ValueFormRootField>({
  name: 'valueForm',
  handleSubmit: ({ control, value }) => {
    expectType<MFC<MFGF<{ value: FormValue }>>>(control);
    expectType<FormValue | undefined>(value);
  },
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'text',
    },
    {
      name: 'age',
      title: 'Age',
      type: 'number',
    },
  ],
});

type PossibleNames = Parameters<typeof valueForm.getControl>[0];
expectAssignable<PossibleNames>('name');
expectAssignable<PossibleNames>('age');

expectType<ValueFormRootField>(valueForm.field);
const valueFormNameControl = valueForm.getControl('name');
if (!valueFormNameControl) throw new Error('Control not found');
type ValueFormNameControlType = MFC<MFGF<FieldParams> & WithValue<string>>;
expectType<ValueFormNameControlType>(valueFormNameControl);

interface LoremField extends MFF<{ value: string }> {
  name: 'lorem';
}

interface DolorField extends MFF<{ value: number; name: 'dolor' }> {
  defaultValue: 42;
}

type NamedFieldsRootField = MFF<{ value: object; fields: LoremField | DolorField }>;

const namedFieldsForm = createMargaritaForm<NamedFieldsRootField>({
  name: 'namedFieldsForm',
  fields: [
    {
      name: 'lorem',
    },
    {
      name: 'dolor',
      defaultValue: 42,
    },
  ],
});

expectType<NamedFieldsRootField>(namedFieldsForm.field);
const namedFieldsFormLoremControl = namedFieldsForm.getControl('lorem');
if (!namedFieldsFormLoremControl) throw new Error('Control not found');
expectType<MFC<LoremField>>(namedFieldsFormLoremControl);
expectType<string>(namedFieldsFormLoremControl.value);

const namedFieldsFormIpsumControl = namedFieldsForm.getControl('ipsum');
expectType<never>(namedFieldsFormIpsumControl);

const namedFieldsFormDolorControl = namedFieldsForm.getControl('dolor');
if (!namedFieldsFormDolorControl) throw new Error('Control not found');
expectType<MFC<DolorField>>(namedFieldsFormDolorControl);
expectType<number>(namedFieldsFormDolorControl.value);
