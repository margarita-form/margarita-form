import { switchMap } from 'rxjs';
import { resolveFunctionOutputs } from '../helpers/resolve-function-outputs';
import type {
  MargaritaFormControl,
  MargaritaFormField,
  MargaritaFormFieldContext,
  MargaritaFormFieldFunctionOutput,
  MargaritaFormFieldStateKeys,
  MargaritaFormState,
} from '../margarita-form-types';

const fieldStateKeys: MargaritaFormFieldStateKeys[] = [
  'active',
  'disabled',
  'readOnly',
];

const defaultState: MargaritaFormState = {
  // Context
  control: null,
  // Dynamic state
  valid: true,
  errors: {},
  // Automatic state
  focus: false,
  pristine: true,
  untouched: true,
  // User defined state
  enabled: true,
  editable: true,
  active: true,
  // Getters and setters
  get invalid() {
    return !this.valid;
  },
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
  get readOnly() {
    return !this.editable;
  },
  set readOnly(val: boolean) {
    this.editable = !val;
  },
  get inactive() {
    return !this.editable;
  },
  set inactive(val: boolean) {
    this.active = !val;
  },
  get shouldShowError() {
    return this.invalid && this.dirty;
  },
};

export const getDefaultState = (
  control: MargaritaFormControl,
  respectField = true
): MargaritaFormState => {
  const state = { control } as MargaritaFormState;
  Object.setPrototypeOf(state, defaultState);
  if (control.root.key === control.key) {
    state.submitted = false;
    state.submitting = false;
    state.submitResult = 'not-submitted';
    state.submits = 0;
  }
  if (!respectField) return state;
  fieldStateKeys.forEach((key) => {
    const value = control.field[key];
    if (typeof value === 'boolean') state[key] = value;
    if (typeof value === 'function') state[key] = false;
  });
  return state;
};

export const _createUserDefinedState = <
  F extends MargaritaFormField = MargaritaFormField
>(
  control: MargaritaFormControl<unknown, F>
) => {
  const { field } = control;
  return control.valueChanges.pipe(
    switchMap((value) => {
      const context = {
        control,
        value,
        field,
        params: null,
      } as unknown as MargaritaFormFieldContext<boolean>;

      const entries = fieldStateKeys.reduce((acc, key) => {
        const state = field[key];
        if (typeof state !== 'undefined') {
          if (typeof state === 'function') {
            const result = state(context);
            acc.push([key, result]);
          }
        }
        return acc;
      }, [] as [MargaritaFormFieldStateKeys, MargaritaFormFieldFunctionOutput<boolean>][]);

      return resolveFunctionOutputs('State', context, entries);
    })
  );
};
