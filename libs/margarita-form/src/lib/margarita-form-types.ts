/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaForm } from './margarita-form';

export type CommonRecord<TYPE = unknown> = Record<string | number | symbol, TYPE>;

export interface MargaritaFormFieldContext<CONTROL extends MargaritaFormControl = MFC, PARAMS = any> {
  value: CONTROL['value'];
  params: PARAMS;
  control: CONTROL;
}

export type MargaritaFormResolverOutput<OUTPUT = unknown> = OUTPUT | Promise<OUTPUT> | Observable<OUTPUT>;

export type MargaritaFormGroupings = 'group' | 'repeat-group' | 'array';

export type MargaritaFormResolver<OUTPUT = unknown, PARAMS = unknown, CONTROL extends MFC = MFC> = (
  context: MargaritaFormFieldContext<CONTROL, PARAMS>
) => MargaritaFormResolverOutput<OUTPUT>;

export type MargaritaFormFieldParams = CommonRecord<any | MargaritaFormResolver<any>>;

export type MargaritaFormFieldAttributes = CommonRecord<any | MargaritaFormResolver<any>>;

export interface MargaritaFormValidatorResult {
  valid: boolean;
  error?: unknown;
}

export type MargaritaFormValidator<PARAMS = unknown> = MargaritaFormResolver<MargaritaFormValidatorResult, PARAMS>;

export type MargaritaFormFieldValidationsState = CommonRecord<MargaritaFormValidatorResult>;

export type MargaritaFormFieldValidation = CommonRecord<any | MargaritaFormResolver<MargaritaFormValidatorResult>>;

export type MargaritaFormValidators = CommonRecord<MargaritaFormValidator<any>>;

export type MargaritaFormResolvers = CommonRecord<MargaritaFormResolver<any>>;

export interface MargaritaFormField {
  name: string;
  title?: string;
  fields?: MargaritaFormField[];
  grouping?: MargaritaFormGroupings;
  startWith?: number;
  template?: Partial<MargaritaFormField>;
  initialValue?: any;
  control?: MargaritaFormControl<unknown, this>;
  validation?: MargaritaFormFieldValidation;
  params?: MargaritaFormFieldParams;
  state?: Partial<MargaritaFormState>;
  attributes?: MargaritaFormFieldAttributes;
  resolvers?: MargaritaFormResolvers;
  validators?: MargaritaFormValidators;
}

export interface MargaritaFormRootFieldParams<VALUE> {
  options?: MargaritaFormOptions;
  handleSubmit?: {
    valid: <FORM extends MargaritaForm<VALUE> = MargaritaForm<VALUE>>(form: FORM) => unknown | Promise<unknown>;
    invalid?: <FORM extends MargaritaForm<VALUE> = MargaritaForm<VALUE>>(form: FORM) => unknown | Promise<unknown>;
  };
}

export type MargaritaFormRootField<VALUE = unknown> = MargaritaFormField & MargaritaFormRootFieldParams<VALUE>;

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

export type MargaritaFormBaseElement<CONTROL extends MFC = MFC, NODE extends HTMLElement | null = HTMLElement | any> = NODE & {
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
