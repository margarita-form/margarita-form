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
import { MargaritaFormValueControl } from './margarita-form-value-control';
import { MargaritaFormGroupControl } from './margarita-form-group-control';

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
    detectInputElementValidations = true,
    asyncFunctionWarningTimeout = 2000,
    disableFormWhileSubmitting = true,
    handleSuccesfullSubmit = 'disable',
    allowConcurrentSubmits = false,
  } = options;

  const initialField = { name: 'root', fields, initialValue } as unknown as F;

  const form = new MargaritaFormGroupControl<T, F>(
    initialField,
    null,
    null,
    validators
  ) as MargaritaForm<T, F>;

  Object.assign(form, {
    detectInputElementValidations,
    asyncFunctionWarningTimeout,
    disableFormWhileSubmitting,
    handleSuccesfullSubmit,
  });

  form.submit = async () => {
    await form.validate();
    if (!handleSubmit) throw 'Add "handleSubmit" option to submit form!';
    const canSubmit = allowConcurrentSubmits || !form.state.submitting;
    if (!canSubmit) throw 'Form is already submitting!';

    form.updateStateValue('submitting', true);

    if (disableFormWhileSubmitting) form.updateStateValue('disabled', true);
    if (form.state.valid) {
      return await Promise.resolve(handleSubmit.valid(form))
        .then(() => {
          form.updateStateValue('submitResult', 'success');
          switch (handleSuccesfullSubmit) {
            case 'disable':
              form.updateStateValue('disabled', true);
              break;
            case 'reset':
              form.reset();
              break;
            default:
              form.updateStateValue('disabled', false);
              break;
          }
        })
        .catch(() => {
          form.updateStateValue('submitResult', 'error');
        })
        .finally(() => {
          form.updateStateValue('submitted', true);
          form.updateStateValue('submitting', false);
          const submits = form.state.submits || 0;
          form.updateStateValue('submits', submits + 1);
        });
    }
    if (handleSubmit?.invalid) {
      return await Promise.resolve(handleSubmit.invalid(form)).finally(() => {
        const submits = form.state.submits || 0;
        form.updateState({
          submitting: false,
          submitted: true,
          submitResult: 'form-invalid',
          disabled: false,
          submits: submits + 1,
        });
      });
    }
    throw 'Could not handle form submit!';
  };

  return form;
};

createMargaritaFormFn.asControl = <T>(
  options: Omit<MargaritaFormOptions<T>, 'handleSubmit'>
): MargaritaFormValueControl<T> => {
  const { fields, validators = defaultValidators, initialValue } = options;

  const form = new MargaritaFormValueControl<T>(
    { name: 'root', fields, initialValue },
    null,
    null,
    validators
  );

  return form;
};

export const createMargaritaForm = createMargaritaFormFn;
