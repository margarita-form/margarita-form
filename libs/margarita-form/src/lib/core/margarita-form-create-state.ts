import type {
  MargaritaFormControl,
  MargaritaFormState,
} from '../margarita-form-types';

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
  control: MargaritaFormControl
): MargaritaFormState => {
  const state = { control } as MargaritaFormState;
  Object.setPrototypeOf(state, defaultState);
  if (control._root === control) {
    state.submitted = false;
    state.submitting = false;
  }
  return state;
};
