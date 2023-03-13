import type {
  MargaritaForm,
  MargaritaFormFieldValidators,
  MargaritaFormOptions,
} from './margarita-form-types';
import { requiredValidator } from './validators';
import { MargaritaFormControl } from './margarita-form-control';
import { MargaritaFormGroup } from './margarita-form-control-group';

const defaultValidators: MargaritaFormFieldValidators = {
  required: requiredValidator(),
};

const createMargaritaFormFn = <T>(
  options: MargaritaFormOptions<T>
): MargaritaForm => {
  const {
    fields,
    validators = defaultValidators,
    initialValue,
    handleSubmit,
  } = options;
  const form = new MargaritaFormGroup<T>(
    { name: 'root', fields, initialValue },
    null,
    null,
    validators
  ) as MargaritaForm<T>;

  form.submit = () => {
    if (!handleSubmit) throw 'Add "handleSubmit" option to submit form!';
    if (form.state.valid) return handleSubmit.valid(form.value);
    if (handleSubmit?.invalid) return handleSubmit.invalid(form.value);
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
