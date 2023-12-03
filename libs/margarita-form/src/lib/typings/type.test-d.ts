import { expectType } from 'tsd';
import { MFC, MFCA, MFF, MFGF, createMargaritaForm } from '../../index';

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
