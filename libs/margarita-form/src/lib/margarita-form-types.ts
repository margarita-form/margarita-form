/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaForm } from './margarita-form';
import type { MargaritaFormControlManagers } from './managers/margarita-form-default-managers';

export interface MargaritaFormControlContext {
  form?: MF;
  root?: MF | MFC;
  parent?: MF | MFC;
  keyStore?: Set<string>;
}

export type CommonRecord<TYPE = unknown> = Record<string | number | symbol, TYPE>;

export interface MargaritaFormFieldContext<CONTROL extends MargaritaFormControl = MFC, PARAMS = any> {
  value: CONTROL['value'];
  params: PARAMS;
  control: CONTROL;
  errorMessage?: string;
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

export type MargaritaFormHandleLocalizeParentFn<FIELD> = (params: {
  field: FIELD;
  parent: MFC<unknown, MFF>;
  locales: string[];
}) => Partial<FIELD> | CommonRecord;

export type MargaritaFormHandleLocalizeChildFn<FIELD> = (params: {
  field: FIELD;
  parent: MFC<unknown, MFF>;
  locale: string;
}) => Partial<FIELD> | CommonRecord;

export interface MargaritaFormHandleLocalize<FIELD> {
  parent?: MargaritaFormHandleLocalizeParentFn<FIELD>;
  child?: MargaritaFormHandleLocalizeChildFn<FIELD>;
}

export interface MargaritaFormField<EXTENDS = MFF> extends Partial<UserDefinedStates> {
  name: string;
  fields?: EXTENDS[];
  grouping?: MargaritaFormGroupings;
  startWith?: number;
  template?: Partial<EXTENDS>;
  initialValue?: any;
  validation?: MargaritaFormFieldValidation;
  params?: MargaritaFormFieldParams;
  attributes?: MargaritaFormFieldAttributes;
  resolvers?: MargaritaFormResolvers;
  validators?: MargaritaFormValidators;
  localize?: boolean;
  wasLocalized?: boolean;
  isLocale?: boolean;
  locale?: string;
  handleLocalize?: MargaritaFormHandleLocalize<EXTENDS>;
}

export interface MargaritaFormRootField<VALUE> {
  name: string;
  locales?: string[];
  config?: MargaritaFormConfig;
  handleSubmit?: MargaritaFormSubmitHandlers<VALUE>;
}

export type MargaritaFormStateErrors = Record<string, unknown>;
export type MargaritaFormStateChildren = MargaritaFormState[];

export type MargaritaFormFieldState = MargaritaFormResolverOutput<boolean> | MargaritaFormResolver<boolean>;

export interface UserDefinedStates<TYPE = MargaritaFormFieldState> {
  enabled: TYPE;
  disabled: TYPE;
  editable: TYPE;
  readOnly: TYPE;
  active: TYPE;
  inactive: TYPE;
}

export interface MargaritaFormState extends UserDefinedStates<boolean> {
  pristine: boolean;
  dirty: boolean;
  untouched: boolean;
  focus: boolean;
  touched: boolean;
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
  hasValue?: boolean;
}

export interface MargaritaFormConfig {
  addDefaultValidators?: boolean;
  addMetadataToArrays?: boolean;
  allowConcurrentSubmits?: boolean;
  asyncFunctionWarningTimeout?: number;
  clearStorageOnSuccessfullSubmit?: boolean;
  detectInputElementValidations?: boolean;
  disableFormWhileSubmitting?: boolean;
  handleSuccesfullSubmit?: 'disable' | 'enable' | 'reset';
  resetFormOnFieldChanges?: boolean;
  showDebugMessages?: boolean;
  useCacheForForms?: boolean;
  useStorage?: false | 'localStorage' | 'sessionStorage';
  useSyncronization?: boolean;
}

export interface MargaritaFormSubmitHandlers<VALUE = unknown> {
  valid: <FORM extends MargaritaForm<VALUE> = MargaritaForm<VALUE>>(form: FORM) => unknown | Promise<unknown>;
  invalid?: <FORM extends MargaritaForm<VALUE> = MargaritaForm<VALUE>>(form: FORM) => unknown | Promise<unknown>;
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

/** Shorthand for {@link MargaritaFormField}  */
export type MFF<EXTENDS = any> = MargaritaFormField<EXTENDS>;
/** Shorthand for {@link MargaritaFormRootField}  */
export type MFRF<VALUE = unknown> = MargaritaFormRootField<VALUE>;
/** Shorthand for {@link MargaritaForm}  */
export type MF<VALUE = any, FIELD extends MFF = any> = MargaritaForm<VALUE, FIELD>;
/** Shorthand for {@link MargaritaFormControl}  */
export type MFC<VALUE = any, FIELD extends MFF = any> = MargaritaFormControl<VALUE, FIELD>;
/** Shorthand for {@link MargaritaFormBaseElement}  */
export type MFBE<CONTROL extends MFC = MFC> = MargaritaFormBaseElement<CONTROL>;
/** Margarita form controls as group */
export type MFCG<VALUE = any, FIELD extends MFF = any> = Record<string, MFC<VALUE, FIELD>>;
/** Margarita form controls as array */
export type MFCA<VALUE = any, FIELD extends MFF = any> = MFC<VALUE, FIELD>[];
/** Margarita form managers */
export type MFCM = MargaritaFormControlManagers;
