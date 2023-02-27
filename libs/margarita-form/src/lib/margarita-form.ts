import type { MargaritaFormOptions } from './margarita-form-types';
import { MargaritaFormGroup } from './margarita-form-group';
import { MargaritaFormArray } from './margarita-form-array';

export type MargaritaForm = MargaritaFormGroup;

const createMargaritaFormFn = (options: MargaritaFormOptions) => {
  const { fields, validators, initialValue } = options;
  return new MargaritaFormGroup(
    { name: 'root', fields, initialValue },
    null,
    null,
    validators
  );
};

createMargaritaFormFn.asArray = (options: MargaritaFormOptions) => {
  const { fields, validators, initialValue } = options;
  return new MargaritaFormArray(
    { name: 'root', fields, initialValue },
    null,
    null,
    validators
  );
};

export const createMargaritaForm = createMargaritaFormFn;
