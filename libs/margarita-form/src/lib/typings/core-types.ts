import type { Observable } from 'rxjs';
import { MF, MFC, MFF, MFGF, MargaritaFormState } from '../margarita-form-types';
import { CommonRecord, NotFunction, OrString } from './util-types';
import { Validation } from './resolver-types';
import { ControlContext, Extensions } from './expandable-types';

export interface MargaritaFormControlBuildParams {
  root?: MF | MFC;
  parent?: MF | MFC;
  initialIndex?: number;
  idStore: Set<string>;
  extensions: Extensions;
}

export interface MargaritaFormControlContext<CONTROL extends MFC = MFC<MFGF>, PARAMS = any> extends ControlContext {
  control: CONTROL;
  value: CONTROL['value'] | undefined;
  params?: PARAMS;
  errorMessage?: string;
}

export type MargaritaFormResolverOutput<OUTPUT = unknown> = OUTPUT | Promise<OUTPUT> | Observable<OUTPUT>;

export type MargaritaFormResolver<OUTPUT = unknown, PARAMS = unknown, CONTROL extends MFC = MFC<MFGF>> = (
  context: MargaritaFormControlContext<CONTROL, PARAMS>
) => MargaritaFormResolverOutput<OUTPUT>;

export type MargaritaFormFieldParams = CommonRecord<NotFunction | MargaritaFormResolver<any>>;

export type MargaritaFormFieldAttributes = CommonRecord<any | MargaritaFormResolver<any>>;

export interface MargaritaFormValidatorResult {
  valid: boolean;
  error?: unknown;
}

export type MargaritaFormValidator<PARAMS = any, VALUE = any> = MargaritaFormResolver<
  MargaritaFormValidatorResult,
  PARAMS,
  MFC<MFGF<{ value: VALUE }>>
>;

export type MargaritaFormFieldValidationsState = CommonRecord<MargaritaFormValidatorResult>;

export interface ResolverParams {
  name: string;
  params?: unknown;
  [key: string]: unknown;
}

export interface FieldValidationParams extends Required<ResolverParams> {
  name: keyof Validation | OrString;
  errorMessage?: string;
}

export type MargaritaFormFieldValidation<VALUE> = {
  [key in keyof Validation]?: Validation[key] | MargaritaFormValidator | FieldValidationParams;
} & Record<string, MargaritaFormValidator<any, VALUE> | FieldValidationParams | NotFunction>;

export type MargaritaFormValidators = CommonRecord<MargaritaFormValidator<any>>;

export type MargaritaFormResolvers = CommonRecord<MargaritaFormResolver<any>>;

export type MargaritaFormStateErrors = Record<string, unknown>;
export type MargaritaFormStateAllErrors = { path: string; errors: MargaritaFormStateErrors; control: MFC }[];
export type MargaritaFormStateChildren = MargaritaFormState[];

export type MargaritaFormFieldState = MargaritaFormResolverOutput<boolean> | MargaritaFormResolver<boolean>;

export type GenerateKeyFunction = (control: MFC) => string;

export type MargaritaFormSubmitHandler<FIELD extends MFF = MFGF, PARAMS = any> = (
  context: MargaritaFormControlContext<MFC<FIELD>, PARAMS>
) => unknown | Promise<unknown>;

export interface MargaritaFormSubmitHandlers<FIELD extends MFF = MFGF> {
  valid: MargaritaFormSubmitHandler<FIELD>;
  invalid?: MargaritaFormSubmitHandler<FIELD>;
}
