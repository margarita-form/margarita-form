/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaFormGroup } from './margarita-form-control-group';

export interface MargaritaFormFieldContext<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField,
  P = any
> {
  value: T;
  field: F;
  control: MargaritaFormControlTypes<T, F>;
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

export type MargaritaFormFieldFunction<
  T = unknown,
  F1 extends MargaritaFormField = MargaritaFormField
> = <F2 extends MargaritaFormField = F1>(
  context: MargaritaFormFieldContext<T, F2>
) => MargaritaFormFieldFunctionOutput;

export interface MargaritaFormFieldValidators<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> {
  [key: string]: MargaritaFormFieldFunction<T, F>;
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

export interface MargaritaFormField {
  name: string;
  fields?: MargaritaFormField[];
  grouping?: MargaritaFormGroupings;
  startWith?: number;
  template?: MargaritaFormField;
  initialValue?: unknown;
  validation?: MargaritaFormFieldValidation;
  validators?: MargaritaFormFieldValidators<unknown, MargaritaFormField>;
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

export interface MargaritaFormOptions<T, F = MargaritaFormField> {
  fields: F[];
  initialValue?: Record<string, unknown>;
  validators?: MargaritaFormFieldValidators;
  handleSubmit?: {
    valid: (value: T) => void | Promise<void>;
    invalid?: (value: T) => void | Promise<void>;
  };
}

export type MargaritaFormObjectControlTypes<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> = MargaritaFormGroup<T, F>;

export type MargaritaFormControlTypes<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> = MargaritaFormControl<T, F> | MargaritaFormObjectControlTypes<T, F>;

export type MargaritaFormControlsGroup<
  T,
  F extends MargaritaFormField = MargaritaFormField
> = Record<string, MargaritaFormControlTypes<T, F>>;

export type MargaritaForm<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField,
  C = MargaritaFormGroup<T, F>
> = C & {
  submit: () => void;
};

export type MargaritaFormControlsArray<
  T,
  F extends MargaritaFormField = MargaritaFormField
> = MargaritaFormControlTypes<T, F>[];

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
};
