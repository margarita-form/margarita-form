import type {
  MargaritaFormFieldValidators,
  MargaritaFormOptions,
} from './margarita-form-types';
import { MargaritaFormGroup } from './margarita-form-group';
import { MargaritaFormArray } from './margarita-form-array';
import { requiredValidator } from './validators';

export type MargaritaForm = MargaritaFormGroup;

const defaultValidators: MargaritaFormFieldValidators = {
  required: requiredValidator(),
};

const createMargaritaFormFn = (options: MargaritaFormOptions) => {
  const { fields, validators = defaultValidators, initialValue } = options;
  return new MargaritaFormGroup(
    { name: 'root', fields, initialValue },
    null,
    null,
    validators
  );
};

createMargaritaFormFn.asArray = (options: MargaritaFormOptions) => {
  const { fields, validators = defaultValidators, initialValue } = options;
  return new MargaritaFormArray(
    { name: 'root', fields, initialValue },
    null,
    null,
    validators
  );
};

export const createMargaritaForm = createMargaritaFormFn;
