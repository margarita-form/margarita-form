import type {
  MargaritaFormControlTypes,
  MargaritaFormState,
} from './margarita-form-types';

const defaultState: MargaritaFormState = {
  valid: true,
  errors: {},
  touched: false,
  dirty: false,
  control: null,
};

export const getDefaultState = (
  control: MargaritaFormControlTypes
): MargaritaFormState => {
  return {
    ...defaultState,
    control,
  };
};
