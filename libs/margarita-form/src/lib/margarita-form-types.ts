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
  initialIndex?: number;
}

export type CommonRecord<TYPE = unknown> = Record<string | number | symbol, TYPE>;

export interface MargaritaFormFieldContext<CONTROL extends MargaritaFormControl = MFC, PARAMS = any> {
  control: CONTROL;
  value?: CONTROL['value'];
  params?: PARAMS;
  errorMessage?: string;
}

export type MargaritaFormResolverOutput<OUTPUT = unknown> = OUTPUT | Promise<OUTPUT> | Observable<OUTPUT>;

export type MargaritaFormGroupings = 'group' | 'array' | 'flat';

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
  parent: MFC<MFF>;
  locales: string[];
}) => Partial<FIELD> | CommonRecord;

export type MargaritaFormHandleLocalizeChildFn<FIELD> = (params: {
  field: FIELD;
  parent: MFC<MFF>;
  locale: string;
}) => Partial<FIELD> | CommonRecord;

export interface MargaritaFormHandleLocalize<FIELD> {
  parent?: MargaritaFormHandleLocalizeParentFn<FIELD>;
  child?: MargaritaFormHandleLocalizeChildFn<FIELD>;
}

export interface MargaritaFormField<VALUE = unknown, EXTENDS = MFF> extends Partial<UserDefinedStates> {
  name: string;
  fields?: EXTENDS[];
  grouping?: MargaritaFormGroupings;
  startWith?: number | (number | string)[];
  initialValue?: VALUE;
  validation?: MargaritaFormFieldValidation;
  params?: MargaritaFormFieldParams;
  attributes?: MargaritaFormFieldAttributes;
  resolvers?: MargaritaFormResolvers;
  validators?: MargaritaFormValidators;
  dispatcher?: MargaritaFormResolver<VALUE>;
  beforeSubmit?: MargaritaFormResolver;
  afterSubmit?: MargaritaFormResolver;
  handleSubmit?: string | MargaritaFormSubmitHandler<MFF<VALUE, EXTENDS>> | MargaritaFormSubmitHandlers<MFF<VALUE, EXTENDS>>;
  locales?: string[];
  localize?: boolean;
  wasLocalized?: boolean;
  isLocaleField?: boolean;
  currentLocale?: string;
  handleLocalize?: MargaritaFormHandleLocalize<EXTENDS>;
  i18n?: Record<string, unknown>;
  config?: MargaritaFormConfig;
  useStorage?: false | 'localStorage' | 'sessionStorage' | 'searchParams' | StorageLike;
  useSyncronization?: false | 'broadcastChannel' | BroadcastLikeConstructor;
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
  validating: boolean;
  validated: boolean;
  valid: boolean;
  invalid: boolean;
  shouldShowError: undefined | boolean;
  submitting: boolean;
  submitted: boolean;
  submits: number;
  submitResult: 'not-submitted' | 'form-invalid' | 'error' | 'success';
  errors: MargaritaFormStateErrors;
  children?: MargaritaFormStateChildren;
  hasValue?: boolean;
}

export type GenerateKeyFunction = (control: MFC) => string;

export interface MargaritaFormConfig {
  addDefaultValidators?: boolean;
  addMetadataToArrays?: boolean | 'flat';
  detectAndRemoveMetadataForArrays?: boolean;
  allowConcurrentSubmits?: boolean;
  asyncFunctionWarningTimeout?: number;
  clearStorageOnSuccessfullSubmit?: boolean;
  detectInputElementValidations?: boolean;
  disableFormWhileSubmitting?: boolean;
  allowInvalidSubmit?: boolean;
  handleSuccesfullSubmit?: 'disable' | 'enable' | 'reset';
  resetFormOnFieldChanges?: boolean;
  showDebugMessages?: boolean;
  useCacheForForms?: boolean;
  storageKey?: 'key' | 'name' | GenerateKeyFunction;
  syncronizationKey?: 'key' | 'name' | GenerateKeyFunction;
}

export type MargaritaFormSubmitHandler<FIELD extends MFF = MFF> = (form: MF<FIELD>) => unknown | Promise<unknown>;

export interface MargaritaFormSubmitHandlers<FIELD extends MFF = MFF> {
  valid: MargaritaFormSubmitHandler<FIELD>;
  invalid?: MargaritaFormSubmitHandler<FIELD>;
}

export type MargaritaFormBaseElement<CONTROL extends MFC = MFC, NODE extends HTMLElement = HTMLElement> = NODE & {
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
  value?: DATA;
  requestSend?: boolean;
}

export interface BroadcastLike {
  postMessage(message: BroadcasterMessage): void;
  listenToMessages<DATA>(): void | Observable<BroadcasterMessage<DATA>>;
}

type IsUnion<T, U extends T = T> = T extends unknown ? ([U] extends [T] ? false : true) : false;

export type ControlIdentifier = string | number;
export type DeepControlIdentifier<FIELD extends MFF> = IsUnion<FIELD['name']> extends true
  ? FIELD['name'] | number | ControlIdentifier[]
  : ControlIdentifier | ControlIdentifier[];

export type ChildField<ParentField extends MFF> = NonNullable<ParentField['fields']>[number];
export type ControlValue<Field extends MFF> = NonNullable<Field['initialValue']>;
export type ControlValueItem<Field extends MFF> = ControlValue<Field>[number];
export type ChildFieldFromName<ParentField extends MFF, NAME extends string> = Extract<ChildField<ParentField>, { name: NAME }>;

type ValueFromParent<PARENT_FIELD extends MFF, IDENTIFIER extends PropertyKey> = ControlValue<PARENT_FIELD> extends Record<IDENTIFIER, any>
  ? ControlValue<PARENT_FIELD>[IDENTIFIER]
  : never;

type FieldWithParentValue<BASE_FIELD extends MFF, PARENT_FIELD extends MFF, IDENTIFIER extends PropertyKey> = BASE_FIELD &
  MFF<ValueFromParent<PARENT_FIELD, IDENTIFIER>>;

export type ChildControl<
  FIELD_TYPE,
  IDENTIFIER,
  PARENT_FIELD extends MFF,
  CHILD_FIELD extends MFF = ChildField<PARENT_FIELD>
> = FIELD_TYPE extends MFC
  ? FIELD_TYPE
  : FIELD_TYPE extends MFF
  ? MFC<FIELD_TYPE>
  : IDENTIFIER extends CHILD_FIELD['name']
  ? MFC<
      ChildFieldFromName<CHILD_FIELD, IDENTIFIER> extends never
        ? FieldWithParentValue<CHILD_FIELD, PARENT_FIELD, IDENTIFIER>
        : ChildFieldFromName<CHILD_FIELD, IDENTIFIER>
    >
  : MFC<CHILD_FIELD>;

export interface ControlLike<FIELD extends MFF = MFF, VALUE = ControlValue<FIELD>, CHILD_FIELD extends MFF = ChildField<FIELD>> {
  get name(): FIELD['name'];

  // Value

  get value(): VALUE;
  set value(value: VALUE);

  setValue(value: VALUE | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): void;
  patchValue(value: Partial<VALUE> | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): void;
  dispatchValue(value: VALUE | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): Promise<void>;

  addValue(value: ControlValueItem<FIELD>, mustBeUnique?: boolean, setAsDirty?: boolean, emitEvent?: boolean): void;

  // Controls

  get controls(): MFC<CHILD_FIELD>[];
  get activeControls(): MFC<CHILD_FIELD>[];

  addControl<CHILD_FIELD extends MFF = ChildField<FIELD>>(field: FIELD, replaceExisting?: boolean): MFC<CHILD_FIELD>;

  getOrAddControl<CHILD_FIELD extends MFF = ChildField<FIELD>>(field: FIELD): MFC<CHILD_FIELD>;

  hasControl(identifier: ControlIdentifier): boolean;

  getControl<FIELD_TYPE, IDENTIFIER extends DeepControlIdentifier<ChildField<FIELD>> = DeepControlIdentifier<ChildField<FIELD>>>(
    identifier: IDENTIFIER
  ): ChildControl<FIELD_TYPE, IDENTIFIER, FIELD>;

  appendControls<CHILD_FIELD extends MFF = FIELD>(fieldTemplates: string[] | CHILD_FIELD[]): MFC<CHILD_FIELD>[];

  appendControl<CHILD_FIELD extends MFF = FIELD>(fieldTemplate?: string | CHILD_FIELD, overrides?: Partial<CHILD_FIELD>): MFC<CHILD_FIELD>;

  setRef(ref: any): void;

  getFieldValue<OUTPUT = unknown>(key: keyof FIELD, defaultValue?: OUTPUT): OUTPUT;
}

// Shorthands

/** Shorthand for {@link MargaritaFormField}  */
export type MFF<VALUE = any, EXTENDS = any> = MargaritaFormField<VALUE, EXTENDS>;
/** Shorthand for {@link MargaritaForm}  */
export type MF<FIELD extends MFF = MFF> = MargaritaForm<FIELD>;
/** Shorthand for {@link MargaritaFormControl}  */
export type MFC<FIELD extends MFF = MFF> = MargaritaFormControl<FIELD>;
/** Shorthand for {@link MargaritaFormBaseElement}  */
export type MFBE<CONTROL extends MFC = MFC> = MargaritaFormBaseElement<CONTROL>;
/** Margarita form controls as group */
export type MFCG<FIELD extends MFF = any> = Record<string, MFC<FIELD>>;
/** Margarita form controls as array */
export type MFCA<FIELD extends MFF = any> = MFC<FIELD>[];
/** Margarita form managers */
export type MFCM = MargaritaFormControlManagers;
/** Get child control */
export type MFCCF<FIELD extends MFF> = MFC<ChildField<FIELD>>;
