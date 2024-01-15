import { expectType, expectNotType } from 'tsd';
import { FieldChild, MFC, MFCA, MFF, MFGF, createMargaritaForm } from '../index';

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

type StringField = CustomFieldBase<'text', string>;
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
          type: 'text',
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
expectType<FieldChild<MFGF & AdvField>>(advField.fields![0]);

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
