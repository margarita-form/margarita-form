/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormArray } from './margarita-form-array';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaFormGroup } from './margarita-form-group';

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

export interface MargaritaFormFieldState {
  [key: string]: unknown | MargaritaFormFieldFunction<unknown>;
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
  state?: MargaritaFormFieldState;
  control?: MargaritaFormControlTypes;
}

export type MargaritaFormStateErrors = Record<string, unknown>;
export type MargaritaFormStateChildren = Record<string, MargaritaFormState>;

export interface MargaritaFormState {
  valid: boolean;
  errors: MargaritaFormStateErrors;
  touched: boolean;
  dirty: boolean;
  control: MargaritaFormControlTypes | null;
  children?: Record<string, MargaritaFormState>;
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
  controlsArray?: MargaritaFormControlTypes[] | null;
  setValue: (value: any) => void;
  setRef: (node: HTMLElement | null) => void;
  cleanup: () => void;
}

export type MargaritaFormObjectControlTypes<T = unknown> =
  | MargaritaFormGroup<T>
  | MargaritaFormArray<T>;

export type MargaritaFormControlTypes<T = unknown> =
  | MargaritaFormControl<T>
  | MargaritaFormObjectControlTypes<T>;

export type MargaritaFormControls<T = unknown> = Record<
  string,
  MargaritaFormControlTypes<T>
>;

export type CommonRecord = Record<string | number | symbol, unknown>;
