/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormArray } from './margarita-form-array';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaFormGroup } from './margarita-form-group';

export interface MargaritaFormFieldValidatorContext<T = unknown, P = any> {
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

export type MargaritaFormFieldValidatorOutput<
  T = MargaritaFormFieldValidatorResult
> = T | Promise<T> | Observable<T>;

export type MargaritaFormFieldValidatorFunction<T = unknown> = (
  context: MargaritaFormFieldValidatorContext<T>
) => MargaritaFormFieldValidatorOutput;

export interface MargaritaFormFieldValidators {
  [key: string]: MargaritaFormFieldValidatorFunction;
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
export interface MargaritaFormStatus {
  valid: boolean;
  errors: { [key: string]: string };
  touched: boolean;
  dirty: boolean;
}

export type MargaritaFormFields = MargaritaFormField[];

export interface MargaritaFormOptions {
  fields: MargaritaFormFields;
  initialValue?: Record<string, unknown>;
  validators?: MargaritaFormFieldValidators;
}

export interface MargaritaFormControlBase<T = unknown> {
  field: MargaritaFormField;
  valueChanges: Observable<T>;
  value: T;
  status: MargaritaFormStatus;
  statusChanges: Observable<MargaritaFormStatus>;
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
