import { MargaritaFormControl } from '../margarita-form-control';
import {
  caseValidator,
  controlNameCaseValidator,
  dateValidator,
  emailValidator,
  eaqualsToValidator,
  maxValidator,
  minValidator,
  numberValidator,
  passwordValidator,
  patternValidator,
  phoneValidator,
  requiredValidator,
  typeofValidator,
  urlValidator,
} from '.';

const defaultValidators = {
  case: caseValidator(),
  date: dateValidator(),
  email: emailValidator(),
  eaqualsTo: eaqualsToValidator(),
  max: maxValidator(),
  min: minValidator(),
  controlNameCase: controlNameCaseValidator(),
  number: numberValidator(),
  password: passwordValidator(),
  pattern: patternValidator(),
  phone: phoneValidator(),
  required: requiredValidator(),
  typeof: typeofValidator(),
  url: urlValidator(),
};

Object.entries(defaultValidators).forEach(([name, validator]) => {
  MargaritaFormControl.addValidator(name, validator);
});
