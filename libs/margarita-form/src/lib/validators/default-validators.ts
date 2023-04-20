import { MargaritaFormFieldValidators } from '../margarita-form-types';
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
} from '.';

export const defaultValidators: MargaritaFormFieldValidators = {
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
