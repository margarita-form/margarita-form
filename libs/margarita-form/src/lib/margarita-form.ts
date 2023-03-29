import type {
  MargaritaForm,
  MargaritaFormField,
  MargaritaFormFieldValidators,
  MargaritaFormOptions,
} from './margarita-form-types';
import { requiredValidator } from './validators';
import { MargaritaFormControl } from './margarita-form-control';
import { MargaritaFormGroup } from './margarita-form-control-group';

const defaultValidators: MargaritaFormFieldValidators = {
  required: requiredValidator(),
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

  form.submit = () => {
    if (!handleSubmit) throw 'Add "handleSubmit" option to submit form!';
    if (form.state.valid) return handleSubmit.valid(form);
    if (handleSubmit?.invalid) return handleSubmit.invalid(form);
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
