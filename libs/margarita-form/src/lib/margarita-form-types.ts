/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaFormGroup } from './margarita-form-control-group';

export interface MargaritaFormFieldContext<T = unknown, P = any> {
  value: T;
  field: MargaritaFormField;
  control: MargaritaFormControlTypes<T>;
  params: P;
}

export interface MargaritaFormFieldValidatorResult {
  valid: boolean;
  error?: unknown;
}

export type MargaritaFormFieldValidatorResultEntry = [
  string,
  MargaritaFormFieldValidatorResult
];

export type MargaritaFormFieldFunctionOutput<
  T = MargaritaFormFieldValidatorResult
> = T | Promise<T> | Observable<T>;

export type MargaritaFormFieldFunction<T = unknown> = (
  context: MargaritaFormFieldContext<T>
) => MargaritaFormFieldFunctionOutput;

export interface MargaritaFormFieldValidators {
  [key: string]: MargaritaFormFieldFunction;
}

export interface MargaritaFormFieldValidationsState {
  [key: string]: MargaritaFormFieldValidatorResult;
}

export interface MargaritaFormFieldValidation {
  [key: string]: unknown;
}

export type groupings = 'group' | 'repeat-group' | 'array';
export const arrayGroupings: groupings[] = ['array', 'repeat-group'];

export interface MargaritaFormField {
  name: string;
  fields?: MargaritaFormFields;
  grouping?: groupings;
  initialValue?: unknown;
  validation?: MargaritaFormFieldValidation;
  validators?: MargaritaFormFieldValidators;
  control?: MargaritaFormControlTypes;
}

export type MargaritaFormStateErrors = Record<string, unknown>;
export type MargaritaFormStateChildren = MargaritaFormState[];

export type MargaritaFormStaticStateKeys =
  | 'pristine'
  | 'dirty'
  | 'untouched'
  | 'focus'
  | 'touched'
  | 'enabled'
  | 'disabled'
  | 'editable'
  | 'readonly';

export type MargaritaFormStaticState = Record<
  MargaritaFormStaticStateKeys,
  boolean
>;

export interface MargaritaFormState extends MargaritaFormStaticState {
  valid: boolean;
  errors: MargaritaFormStateErrors;
  control: MargaritaFormControlTypes | null;
  children?: MargaritaFormStateChildren;
}

export type MargaritaFormFields = MargaritaFormField[];

export interface MargaritaFormOptions {
  fields: MargaritaFormFields;
  initialValue?: Record<string, unknown>;
  validators?: MargaritaFormFieldValidators;
}

export interface MargaritaFormControlBase<T = unknown> {
  field: MargaritaFormField;
  validators: MargaritaFormFieldValidators;
  valueChanges: Observable<T>;
  value: T;
  state: MargaritaFormState;
  stateChanges: Observable<MargaritaFormState>;
  parent?: MargaritaFormControlTypes<unknown>;
  controls?: MargaritaFormControls | null;
  refs: MargaritaFormBaseElement[];
  setValue: (value: any) => void;
  setRef: <E = HTMLElement>(ref: E) => void;
  cleanup: () => void;
}

export type MargaritaFormObjectControlTypes<T = unknown> =
  MargaritaFormGroup<T>;

export type MargaritaFormControlTypes<T = unknown> =
  | MargaritaFormControl<T>
  | MargaritaFormObjectControlTypes<T>;

export type MargaritaFormControlsGroup<T> = Record<
  string,
  MargaritaFormControlTypes<T>
>;
export type MargaritaFormControlsArray<T> = MargaritaFormControlTypes<T>[];

export type MargaritaFormControls<T = unknown> =
  | MargaritaFormControlsGroup<T>
  | MargaritaFormControlsArray<T>;

export type CommonRecord = Record<string | number | symbol, unknown>;

export type MargaritaFormBaseElement<
  T = HTMLElement,
  C = MargaritaFormControls<unknown>
> =
  | (T & {
      controls?: C[];
      value?: unknown;
      checked?: boolean;
      multiple?: boolean;
      type?: string;
      name?: string;
    })
  | null;
