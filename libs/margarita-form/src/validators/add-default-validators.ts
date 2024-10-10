import { MargaritaFormControl } from '../margarita-form-control';
import {
  caseValidator,
  controlNameCaseValidator,
  dateValidator,
  emailValidator,
  equalsToValidator,
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
  equalsTo: equalsToValidator(),
  max: maxValidator(),
  min: minValidator(),
  controlNameCase: controlNameCaseValidator(),
  number: numberValidator(),
  password: passwordValidator(),
  pattern: patternValidator(),
  phone: phoneValidator(),
  tel: phoneValidator(),
  required: requiredValidator(),
  typeof: typeofValidator(),
  url: urlValidator(),
};

Object.entries(defaultValidators).forEach(([name, validator]) => {
  MargaritaFormControl.addValidator(name, validator);
});
