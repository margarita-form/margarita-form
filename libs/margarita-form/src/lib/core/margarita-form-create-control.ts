import { MargaritaFormArray } from '../margarita-form-array';
import { MargaritaFormControl } from '../margarita-form-control';
import { MargaritaFormGroup } from '../margarita-form-group';
import {
  arrayGroupings,
  MargaritaFormField,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
} from '../margarita-form-types';

export const createControlFromField = (
  field: MargaritaFormField,
  parent: MargaritaFormObjectControlTypes,
  root: MargaritaFormObjectControlTypes<unknown>,
  validators: MargaritaFormFieldValidators
) => {
  const { fields, grouping = 'group' } = field;
  const isArray = fields && arrayGroupings.includes(grouping);
  if (isArray) return new MargaritaFormArray(field, parent, root, validators);
  if (fields) return new MargaritaFormGroup(field, parent, root, validators);
  return new MargaritaFormControl(field, parent, root, validators);
};
