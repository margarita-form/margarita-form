import type { Observable } from 'rxjs';
import { MF, MFC, MFF, MFGF, MargaritaFormState } from '../margarita-form-types';
import { DefaultValidation, DefaultValidators } from '../validators/default-validators';
import { CommonRecord, NotFunction, OrString } from './util-types';

export interface MargaritaFormControlContext {
  form?: MF;
  root?: MF | MFC;
  parent?: MF | MFC;
  initialIndex?: number;
  idStore: Set<string>;
}

export interface MargaritaFormFieldContext<CONTROL extends MFC = MFC<MFGF>, PARAMS = any> {
  control: CONTROL;
  value?: CONTROL['value'];
  params?: PARAMS;
  errorMessage?: string;
}

export type MargaritaFormResolverOutput<OUTPUT = unknown> = OUTPUT | Promise<OUTPUT> | Observable<OUTPUT>;

export type MargaritaFormResolver<OUTPUT = unknown, PARAMS = unknown, CONTROL extends MFC = MFC<MFGF>> = (
  context: MargaritaFormFieldContext<CONTROL, PARAMS>
) => MargaritaFormResolverOutput<OUTPUT>;

export type MargaritaFormFieldParams = CommonRecord<NotFunction | MargaritaFormResolver<any>>;

export type MargaritaFormFieldAttributes = CommonRecord<any | MargaritaFormResolver<any>>;

export interface MargaritaFormValidatorResult {
  valid: boolean;
  error?: unknown;
}

export type MargaritaFormValidator<PARAMS = unknown> = MargaritaFormResolver<MargaritaFormValidatorResult, PARAMS>;

export type MargaritaFormFieldValidationsState = CommonRecord<MargaritaFormValidatorResult>;

export interface ResolverParams {
  name: string;
  params?: unknown;
  [key: string]: unknown;
}

export interface FieldValidationParams extends Required<ResolverParams> {
  name: keyof DefaultValidation | OrString;
  errorMessage?: string;
}

export type MargaritaFormFieldValidation = {
  [key in keyof DefaultValidation]?: DefaultValidation[key] | MargaritaFormValidator | FieldValidationParams;
} & Record<string, MargaritaFormValidator | FieldValidationParams | NotFunction>;

export type MargaritaFormValidators = Partial<DefaultValidators> & CommonRecord<MargaritaFormValidator<any>>;

export type MargaritaFormResolvers = CommonRecord<MargaritaFormResolver<any>>;

export type MargaritaFormHandleLocalizeParentFn<FIELD extends MFF = MFGF> = (params: {
  field: FIELD;
  parent: MFC<MFF>;
  locales: readonly string[];
}) => Partial<FIELD> | CommonRecord;

export type MargaritaFormHandleLocalizeChildFn<FIELD extends MFF = MFGF> = (params: {
  field: FIELD;
  parent: MFC<MFF>;
  locale: string;
}) => Partial<FIELD> | CommonRecord;

export interface MargaritaFormHandleLocalize<FIELD extends MFF = MFGF> {
  parent?: MargaritaFormHandleLocalizeParentFn<FIELD>;
  child?: MargaritaFormHandleLocalizeChildFn<FIELD>;
}

export type MargaritaFormStateErrors = Record<string, unknown>;
export type MargaritaFormStateAllErrors = { path: string; errors: MargaritaFormStateErrors; control: MFC }[];
export type MargaritaFormStateChildren = MargaritaFormState[];

export type MargaritaFormFieldState = MargaritaFormResolverOutput<boolean> | MargaritaFormResolver<boolean>;

export type GenerateKeyFunction = (control: MFC) => string;

export type MargaritaFormSubmitHandler<FIELD extends MFF = MFGF, PARAMS = any> = (
  form: MFC<FIELD>,
  params?: PARAMS
) => unknown | Promise<unknown>;

export interface MargaritaFormSubmitHandlers<FIELD extends MFF = MFGF> {
  valid: MargaritaFormSubmitHandler<FIELD>;
  invalid?: MargaritaFormSubmitHandler<FIELD>;
}

export interface StorageLikeConstructor {
  new (key: string, control: MFC): StorageLike;
}

export interface StorageLike {
  getItem(key: string): unknown | undefined;
  setItem(key: string, value: unknown): void;
  removeItem(key: string): void;
  listenToChanges<DATA>(key: string): Observable<DATA>;
}

export interface BroadcastLikeConstructor {
  new (key: string, control: MFC): BroadcastLike;
}

export interface BroadcasterMessage<DATA = unknown> {
  key: string;
  uid: string;
  value?: DATA;
  requestSend?: boolean;
}

export interface BroadcastLike {
  postMessage(message: BroadcasterMessage): void;
  listenToMessages<DATA>(): void | Observable<BroadcasterMessage<DATA>>;
}
