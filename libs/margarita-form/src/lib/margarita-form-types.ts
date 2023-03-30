/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormValueControl } from './margarita-form-value-control';
import type { MargaritaFormGroupControl } from './margarita-form-group-control';

export interface MargaritaFormFieldContext<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField,
  P = any
> {
  value: T;
  field: F;
  control: MargaritaFormControl<T, F>;
  params: P;
}

export interface MargaritaFormFieldValidatorResult {
  valid: boolean;
  error?: unknown;
}

export type MargaritaFormFieldFunctionOutputResultEntry<
  T = MargaritaFormFieldValidatorResult
> = [string, T];

export type MargaritaFormFieldFunctionOutput<T> =
  | T
  | Promise<T>
  | Observable<T>;

export type MargaritaFormFieldFunction<
  T = unknown,
  O = unknown,
  F1 extends MargaritaFormField = MargaritaFormField,
  P = any
> = <F2 extends MargaritaFormField = F1>(
  context: MargaritaFormFieldContext<T, F2, P>
) => MargaritaFormFieldFunctionOutput<O>;

export interface MargaritaFormFieldValidators<
  T = unknown,
  O = unknown,
  F extends MargaritaFormField = MargaritaFormField
> {
  [key: string]: MargaritaFormFieldFunction<T, O, F>;
}

export interface MargaritaFormFieldValidationsState {
  [key: string]: MargaritaFormFieldValidatorResult;
}

export interface MargaritaFormFieldValidation {
  [key: string]: unknown;
}

export type MargaritaFormGroupings = 'group' | 'repeat-group' | 'array';
export const arrayGroupings: MargaritaFormGroupings[] = [
  'array',
  'repeat-group',
];

export type MargaritaFormFieldStateKeys = 'active' | 'disabled' | 'readOnly';

export type MargaritaFormFieldStates = Record<
  MargaritaFormFieldStateKeys,
  boolean | MargaritaFormFieldFunction<unknown, boolean>
>;

export interface MargaritaFormField extends Partial<MargaritaFormFieldStates> {
  name: string;
  fields?: MargaritaFormField[];
  grouping?: MargaritaFormGroupings;
  startWith?: number;
  template?: Partial<MargaritaFormField>;
  initialValue?: unknown;
  validation?: MargaritaFormFieldValidation;
  validators?: MargaritaFormFieldValidators<
    unknown,
    MargaritaFormFieldValidatorResult,
    MargaritaFormField
  >;
  control?: MargaritaFormControl;
}

export type MargaritaFormStateErrors = Record<string, unknown>;
export type MargaritaFormStateChildren = MargaritaFormState[];

export type MargaritaFormCommonStateKeys =
  | 'pristine'
  | 'dirty'
  | 'untouched'
  | 'focus'
  | 'touched'
  | 'enabled'
  | 'disabled'
  | 'editable'
  | 'readOnly'
  | 'inactive'
  | 'active';

export type MargaritaFormStaticState = Record<
  MargaritaFormCommonStateKeys,
  boolean
>;

export type MargaritaFormRootStateKeys = 'submitting' | 'submitted';

export type MargaritaFormRootState = Record<
  MargaritaFormRootStateKeys,
  boolean
>;

export interface MargaritaFormState
  extends MargaritaFormStaticState,
    Partial<MargaritaFormRootState> {
  valid: boolean;
  errors: MargaritaFormStateErrors;
  control: MargaritaFormControl | null;
  children?: MargaritaFormStateChildren;
}

export interface MargaritaFormOptions<
  T,
  F extends MargaritaFormField = MargaritaFormField
> {
  fields: F[];
  initialValue?: Record<string, unknown>;
  validators?: MargaritaFormFieldValidators;
  handleSubmit?: {
    valid: (form: MargaritaForm<T, F>) => unknown | Promise<unknown>;
    invalid?: (form: MargaritaForm<T, F>) => unknown | Promise<unknown>;
  };
}

export type MargaritaFormControl<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> = MargaritaFormValueControl<T, F> | MargaritaFormGroupControl<T, F>;

export type MargaritaFormControlsGroup<
  T,
  F extends MargaritaFormField = MargaritaFormField
> = Record<string, MargaritaFormControl<T, F>>;

export type MargaritaForm<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField,
  C = MargaritaFormGroupControl<T, F>
> = C & {
  submit: () => void;
};

export type MargaritaFormControlsArray<
  T,
  F extends MargaritaFormField = MargaritaFormField
> = MargaritaFormControl<T, F>[];

export type CommonRecord = Record<string | number | symbol, unknown>;

export type MargaritaFormBaseElement<
  F extends MargaritaFormField = MargaritaFormField,
  T = HTMLElement,
  C = MargaritaFormControlsArray<unknown, F>
> = T & {
  controls?: C;
  value?: unknown;
  checked?: boolean;
  multiple?: boolean;
  form?: HTMLFormElement;
  type?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  pattern?: string;
};

// Shorthands

export type MF = MargaritaForm;
export type MFF = MargaritaFormField;
export type MFC = MargaritaFormControl;
export type MFVC = MargaritaFormValueControl;
export type MFGC = MargaritaFormGroupControl;
export type MFBE = MargaritaFormBaseElement;
