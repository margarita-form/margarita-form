/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormArray } from './margarita-form-array';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaFormGroup } from './margarita-form-group';

export interface MargaritaFormFieldValidatorContext<T = unknown> {
  value: T;
  field: MargaritaFormField;
  control: MargaritaFormControlTypes<T>;
}

export type MargaritaFormFieldValidatorOutput = boolean | string;

export type MargaritaFormFieldValidatorFunction<T = unknown> = (
  context: MargaritaFormFieldValidatorContext,
  params: T
) =>
  | MargaritaFormFieldValidatorOutput
  | Promise<MargaritaFormFieldValidatorOutput>
  | Observable<MargaritaFormFieldValidatorOutput>;

export interface MargaritaFormFieldValidators {
  [key: string]: MargaritaFormFieldValidatorFunction;
}

export interface MargaritaFormFieldValidation {
  [key: string]: unknown;
}

export interface MargaritaFormField {
  name: string;
  fields?: MargaritaFormFields;
  repeatable?: boolean;
  initialValue?: unknown;
  validation?: MargaritaFormFieldValidators;
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
  data?: Record<string, unknown>;
}

export interface MargaritaFormControlBase<T> {
  field: MargaritaFormField;
  valueChanges: Observable<T>;
  value: T;
  status: MargaritaFormStatus;
  statusChanges: Observable<MargaritaFormStatus>;
  parent?: MargaritaFormControlTypes<unknown>;
  setValue: (value: any) => void;
  setRef: (node: HTMLElement | null) => void;
  cleanup: () => void;
}

export type MargaritaFormControlTypes<T = unknown> =
  | MargaritaFormControl<T>
  | MargaritaFormGroup<T>
  | MargaritaFormArray<T>;

export type MargaritaFormControls<T> = Record<
  string,
  MargaritaFormControlTypes<T>
>;

export type CommonRecord = Record<string | number | symbol, unknown>;
