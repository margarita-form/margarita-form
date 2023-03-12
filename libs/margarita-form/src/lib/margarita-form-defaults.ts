import type {
  MargaritaFormControlTypes,
  MargaritaFormState,
} from './margarita-form-types';

const defaultState: MargaritaFormState = {
  // Context
  control: null,
  // Dynamic state
  valid: true,
  errors: {},
  // Static state
  focus: false,
  pristine: true,
  untouched: true,
  enabled: true,
  editable: true,
  get dirty() {
    return !this.pristine;
  },
  set dirty(val: boolean) {
    this.pristine = !val;
  },
  get touched() {
    return !this.untouched;
  },
  set touched(val: boolean) {
    this.untouched = !val;
  },
  get disabled() {
    return !this.enabled;
  },
  set disabled(val: boolean) {
    this.enabled = !val;
  },
  get readonly() {
    return !this.editable;
  },
  set readonly(val: boolean) {
    this.editable = !val;
  },
};

export const getDefaultState = (
  control: MargaritaFormControlTypes
): MargaritaFormState => {
  const state = { control };
  Object.setPrototypeOf(state, defaultState);
  return state as MargaritaFormState;
};
