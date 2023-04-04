import { debounceTime, switchMap } from 'rxjs';
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
  }
  if (!respectField) return state;
  fieldStateKeys.forEach((key) => {
    const value = control.field[key];
    if (typeof value === 'boolean') state[key] = value;
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
    debounceTime(5),
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
