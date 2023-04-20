/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaForm } from './margarita-form';

export interface MargaritaFormFieldContext<
  CONTROL extends MargaritaFormControl,
  PARAMS = any
> {
  value: CONTROL['value'];
  params: PARAMS;
  control: CONTROL;
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
  CONTROL extends MargaritaFormControl = MFC,
  OUTPUT = unknown,
  PARAMS = any
> = (
  context: MargaritaFormFieldContext<CONTROL, PARAMS>
) => MargaritaFormFieldFunctionOutput<OUTPUT>;

export interface MargaritaFormFieldValidators<
  CONTROL extends MargaritaFormControl = MFC,
  OUTPUT = unknown
> {
  [key: string]: MargaritaFormFieldFunction<CONTROL, OUTPUT>;
}

export type MargaritaFormValidatorFunction<Params> = MargaritaFormFieldFunction<
  MFC,
  MargaritaFormFieldValidatorResult,
  Params
>;

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
  boolean | MargaritaFormFieldFunction<MFC, boolean>
>;

export type MargaritaFormFieldParams<OUTPUT = any> = Record<
  string,
  OUTPUT | MargaritaFormFieldFunction<MFC, OUTPUT>
>;

export type MargaritaFormControlParams<T = unknown> = Record<string, T>;

export interface MargaritaFormField extends Partial<MargaritaFormFieldStates> {
  name: string;
  title?: string;
  fields?: MargaritaFormField[];
  grouping?: MargaritaFormGroupings;
  startWith?: number;
  template?: Partial<MargaritaFormField>;
  initialValue?: any;
  validation?: MargaritaFormFieldValidation;
  validators?: MargaritaFormFieldValidators;
  control?: MargaritaFormControl<unknown, this>;
  params?: MargaritaFormFieldParams;
}

export type MargaritaFormStateErrors = Record<string, unknown>;
export type MargaritaFormStateChildren = MargaritaFormState[];

export interface MargaritaFormState {
  pristine: boolean;
  dirty: boolean;
  untouched: boolean;
  focus: boolean;
  touched: boolean;
  enabled: boolean;
  disabled: boolean;
  editable: boolean;
  readOnly: boolean;
  inactive: boolean;
  active: boolean;
  valid: boolean;
  invalid: boolean;
  shouldShowError: undefined | boolean;
  // Root only
  submitting: boolean;
  submitted: boolean;
  submits: number;
  submitResult: 'not-submitted' | 'form-invalid' | 'error' | 'success';
  errors: MargaritaFormStateErrors;
  children?: MargaritaFormStateChildren;
}

export interface MargaritaFormOptions {
  detectInputElementValidations?: boolean;
  asyncFunctionWarningTimeout?: number;
  disableFormWhileSubmitting?: boolean;
  handleSuccesfullSubmit?: 'disable' | 'enable' | 'reset';
  allowConcurrentSubmits?: boolean;
  addDefaultValidators?: boolean;
}

export interface MargaritaFormRootField extends MargaritaFormField {
  options?: MargaritaFormOptions;
  handleSubmit?: {
    valid: <FORM = MargaritaForm>(form: FORM) => unknown | Promise<unknown>;
    invalid?: <FORM = MargaritaForm>(form: FORM) => unknown | Promise<unknown>;
  };
}

export type CommonRecord = Record<string | number | symbol, unknown>;

export type MargaritaFormBaseElement<
  CONTROL extends MFC = MFC,
  NODE extends HTMLElement = HTMLElement & HTMLOrSVGElement
> = NODE & {
  controls?: CONTROL[];
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

/** Shorthand for {@link MargaritaForm}  */
export type MF = MargaritaForm<any, any>;
/** Shorthand for {@link MargaritaFormField}  */
export type MFF = MargaritaFormField;
/** Shorthand for {@link MargaritaFormControl}  */
export type MFC = MargaritaFormControl<any, any>;
/** Shorthand for {@link MargaritaFormBaseElement}  */
export type MFBE = MargaritaFormBaseElement;
/** Margarita form controls as group */
export type MFCG = Record<string, MFC>;
/** Margarita form controls as array */
export type MFCA = MFC[];
