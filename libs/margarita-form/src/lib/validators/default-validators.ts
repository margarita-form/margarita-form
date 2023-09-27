import {
  andValidator,
  anyOfValidator,
  caseValidator,
  colorValidator,
  controlNameCaseValidator,
  dateValidator,
  emailValidator,
  maxValidator,
  minValidator,
  numberValidator,
  orValidator,
  passwordValidator,
  patternValidator,
  phoneValidator,
  requiredValidator,
  sameAsValidator,
  slugValidator,
  typeofValidator,
  uniqueValidator,
  urlValidator,
} from '.';

export const defaultValidators = {
  and: andValidator(),
  anyOf: anyOfValidator(),
  case: caseValidator(),
  color: colorValidator(),
  date: dateValidator(),
  email: emailValidator(),
  max: maxValidator(),
  min: minValidator(),
  controlNameCase: controlNameCaseValidator(),
  number: numberValidator(),
  or: orValidator(),
  password: passwordValidator(),
  pattern: patternValidator(),
  phone: phoneValidator(),
  required: requiredValidator(),
  sameAs: sameAsValidator(),
  slug: slugValidator(),
  typeof: typeofValidator(),
  unique: uniqueValidator(),
  url: urlValidator(),
};

export type DefaultValidators = typeof defaultValidators;
export type DefaultValidatorNames = keyof DefaultValidators;
export type DefaultValidator<T extends DefaultValidatorNames> = DefaultValidators[T];

type ValidatorParam<T extends DefaultValidatorNames> = Parameters<DefaultValidators[T]>[0]['params'];
export type DefaultValidation = {
  [K in DefaultValidatorNames]: ValidatorParam<K>;
};
