import type {
  MargaritaFormControlTypes,
  MargaritaFormStatus,
} from './margarita-form-types';

const defaultStatus: MargaritaFormStatus = {
  valid: true,
  errors: {},
  touched: false,
  dirty: false,
  control: null,
};

export const getDefaultStatus = (
  control: MargaritaFormControlTypes
): MargaritaFormStatus => {
  return {
    ...defaultStatus,
    control,
  };
};
