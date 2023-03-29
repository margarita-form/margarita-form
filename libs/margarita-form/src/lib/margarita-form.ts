import type {
  MargaritaForm,
  MargaritaFormField,
  MargaritaFormFieldValidators,
  MargaritaFormOptions,
} from './margarita-form-types';
import {
  colorValidator,
  dateValidator,
  emailValidator,
  maxValidator,
  minValidator,
  numberValidator,
  patternValidator,
  phoneValidator,
  requiredValidator,
  sameAsValidator,
  slugValidator,
  uniqueValidator,
  urlValidator,
} from './validators';
import { MargaritaFormControl } from './margarita-form-control';
import { MargaritaFormGroup } from './margarita-form-control-group';

const defaultValidators: MargaritaFormFieldValidators = {
  color: colorValidator(),
  date: dateValidator(),
  email: emailValidator(),
  min: minValidator(),
  max: maxValidator(),
  required: requiredValidator(),
  number: numberValidator(),
  pattern: patternValidator(),
  tel: phoneValidator(),
  phone: phoneValidator(),
  sameAs: sameAsValidator(),
  slug: slugValidator(),
  unique: uniqueValidator(),
  url: urlValidator(),
};

const createMargaritaFormFn = <
  T,
  F extends MargaritaFormField = MargaritaFormField
>(
  options: MargaritaFormOptions<T, F>
): MargaritaForm<T, F> => {
  const {
    fields,
    validators = defaultValidators,
    initialValue,
    handleSubmit,
  } = options;

  const initialField = { name: 'root', fields, initialValue } as unknown as F;

  const form = new MargaritaFormGroup<T, F>(
    initialField,
    null,
    null,
    validators
  ) as MargaritaForm<T, F>;

  form.submit = async () => {
    if (!handleSubmit) throw 'Add "handleSubmit" option to submit form!';
    form.updateStateValue('submitting', true);

    if (form.state.valid) {
      return await Promise.resolve(handleSubmit.valid(form))
        .then(() => form.updateStateValue('submitted', true))
        .catch(() => form.updateStateValue('submitted', false))
        .finally(() => form.updateStateValue('submitting', false));
    }
    if (handleSubmit?.invalid) {
      return await Promise.resolve(handleSubmit.invalid(form))
        .then(() => form.updateStateValue('submitted', false))
        .catch(() => form.updateStateValue('submitted', false))
        .finally(() => form.updateStateValue('submitting', false));
    }
  };

  return form;
};

createMargaritaFormFn.asControl = <T>(
  options: Omit<MargaritaFormOptions<T>, 'handleSubmit'>
): MargaritaFormControl<T> => {
  const { fields, validators = defaultValidators, initialValue } = options;

  const form = new MargaritaFormControl<T>(
    { name: 'root', fields, initialValue },
    null,
    null,
    validators
  );

  return form;
};

export const createMargaritaForm = createMargaritaFormFn;
