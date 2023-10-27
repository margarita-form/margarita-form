import {
  andValidator,
  anyOfValidator,
  caseValidator,
  colorValidator,
  controlNameCaseValidator,
  dateValidator,
  emailValidator,
  eaqualsToValidator,
  maxValidator,
  minValidator,
  numberValidator,
  integerValidator,
  floatValidator,
  positiveNumberValidator,
  negativeNumberValidator,
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
  yupValidator,
  zodValidator,
} from '.';

export const defaultValidators = {
  and: andValidator(),
  anyOf: anyOfValidator(),
  case: caseValidator(),
  color: colorValidator(),
  date: dateValidator(),
  email: emailValidator(),
  eaqualsTo: eaqualsToValidator(),
  max: maxValidator(),
  min: minValidator(),
  controlNameCase: controlNameCaseValidator(),
  number: numberValidator(),
  integer: integerValidator(),
  float: floatValidator(),
  positiveNumber: positiveNumberValidator(),
  negativeNumber: negativeNumberValidator(),
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
  yup: yupValidator(),
  zod: zodValidator(),
};

export type DefaultValidators = typeof defaultValidators;
export type DefaultValidatorNames = keyof DefaultValidators;
export type DefaultValidator<T extends DefaultValidatorNames> = DefaultValidators[T];

type ValidatorParam<T extends DefaultValidatorNames> = Parameters<DefaultValidators[T]>[0]['params'];
export type DefaultValidation = {
  [K in DefaultValidatorNames]: ValidatorParam<K>;
};
