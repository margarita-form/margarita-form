/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaForm } from './margarita-form';
import type { MargaritaFormControlManagers } from './managers/margarita-form-default-managers';
import type { DefaultValidators, DefaultValidation } from './validators/default-validators';
import { Params } from './managers/margarita-form-params-manager';
import { MargaritaFormExtensions } from './extensions/margarita-form-extensions';

export type CommonRecord<TYPE = unknown> = Record<PropertyKey, TYPE>;
export type IsUnion<T, U extends T = T> = T extends unknown ? ([U] extends [T] ? false : true) : false;
export type IsSpecifiedString<T> = T extends string ? (string extends T ? false : true) : false;
export type NeverObj = Record<never, never>;
export type OrAny = any & NeverObj;
export type NotFunction = string | number | boolean | object | null | undefined | CommonRecord;
export type OrT<T> = T & NeverObj;
export type OrString = OrT<string>;
export type OrNumber = OrT<number>;
export type BothTrue<T, U> = T extends true ? (U extends true ? true : false) : false;
export type EitherTrue<T, U> = T extends true ? true : U extends true ? true : false;

export interface MargaritaFormControlContext {
  form?: MF;
  root?: MF | MFC;
  parent?: MF | MFC;
  initialIndex?: number;
}

export interface MargaritaFormFieldContext<CONTROL extends MFC = MFC, PARAMS = any> {
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

export type MargaritaFormFieldParams = CommonRecord<NotFunction | MargaritaFormResolver<any>>;

export type MargaritaFormFieldAttributes = CommonRecord<any | MargaritaFormResolver<any>>;

export interface MargaritaFormValidatorResult {
  valid: boolean;
  error?: unknown;
}

export type MargaritaFormValidator<PARAMS = unknown> = MargaritaFormResolver<MargaritaFormValidatorResult, PARAMS>;

export type MargaritaFormFieldValidationsState = CommonRecord<MargaritaFormValidatorResult>;

export type MargaritaFormFieldValidation = Partial<DefaultValidation> &
  CommonRecord<NotFunction | MargaritaFormResolver<MargaritaFormValidatorResult>>;

export type MargaritaFormValidators = Partial<DefaultValidators> & CommonRecord<MargaritaFormValidator<any>>;

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

export interface MargaritaFormField<VALUE = unknown, EXTENDS = MFF, I18N = Record<string, any>> extends Partial<UserDefinedStates> {
  name: string;
  fields?: EXTENDS[];
  grouping?: MargaritaFormGroupings;
  startWith?: number | (number | string)[];
  initialValue?: VALUE;
  params?: MargaritaFormFieldParams;
  attributes?: MargaritaFormFieldAttributes;
  resolvers?: MargaritaFormResolvers;
  validators?: MargaritaFormValidators;
  validation?: MargaritaFormFieldValidation;
  dispatcher?: MargaritaFormResolver<VALUE>;
  transformer?: MargaritaFormResolver<VALUE>;
  beforeSubmit?: MargaritaFormResolver;
  afterSubmit?: MargaritaFormResolver;
  onCreate?: MargaritaFormResolver;
  onRemove?: MargaritaFormResolver;
  onChanges?: MargaritaFormResolver;
  onValueChanges?: MargaritaFormResolver;
  onStateChanges?: MargaritaFormResolver;
  onChildControlChanges?: MargaritaFormResolver;
  handleSubmit?: string | MargaritaFormSubmitHandler<MFF<VALUE, EXTENDS>> | MargaritaFormSubmitHandlers<MFF<VALUE, EXTENDS>>;
  locales?: string[];
  localize?: boolean;
  wasLocalized?: boolean;
  isLocaleField?: boolean;
  currentLocale?: string;
  handleLocalize?: MargaritaFormHandleLocalize<EXTENDS>;
  i18n?: I18N;
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
  hidden: TYPE;
  visible: TYPE;
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
  allowUnresolvedArrayChildNames?: boolean;
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

export type MargaritaFormSubmitHandler<FIELD extends MFF = MFF, PARAMS = any> = (
  form: MFC<FIELD>,
  params?: PARAMS
) => unknown | Promise<unknown>;

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
  uid: string;
  value?: DATA;
  requestSend?: boolean;
}

export interface BroadcastLike {
  postMessage(message: BroadcasterMessage): void;
  listenToMessages<DATA>(): void | Observable<BroadcasterMessage<DATA>>;
}

export type ControlIdentifier = OrString | OrNumber;

export type DeepControlIdentifier<
  PARENT_FIELD extends MFF,
  CHILD_FIELD extends MFF = ChildField<PARENT_FIELD>,
  NAME extends string = CHILD_FIELD['name']
> = OrT<NAME> | ControlValueKey<PARENT_FIELD> | ControlIdentifier | ControlIdentifier[];

export type ChildField<ParentField extends MFF> = NonNullable<ParentField['fields']>[number];
export type ControlValue<Field extends MFF> = NonNullable<Field['initialValue']>;
export type ControlValueKey<FIELD extends MFF, VALUE = ControlValue<FIELD>> = VALUE extends Array<any> ? PropertyKey : keyof VALUE;
export type ControlValueItem<Field extends MFF> = ControlValue<Field>[number];
export type ChildFieldFromName<PARENT_FIELD extends MFF, NAME extends string> = Extract<ChildField<PARENT_FIELD>, { name: NAME }>;

type ValueFromParent<PARENT_FIELD extends MFF, IDENTIFIER extends PropertyKey> = ControlValue<PARENT_FIELD> extends Record<IDENTIFIER, any>
  ? ControlValue<PARENT_FIELD>[IDENTIFIER]
  : ControlValue<PARENT_FIELD> extends Array<any>
  ? ControlValue<PARENT_FIELD>[number]
  : never;

type GetFieldOfType<FIELD_UNION, VALUE> = Extract<FIELD_UNION, MFF<VALUE>>;
type WithValue<VALUE> = { initialValue: VALUE };

type FieldWithParentValue<
  PARENT_FIELD extends MFF,
  IDENTIFIER extends PropertyKey,
  CHILD_FIELD extends MFF = ChildField<PARENT_FIELD>,
  VALUE = ValueFromParent<PARENT_FIELD, IDENTIFIER>
> = GetFieldOfType<CHILD_FIELD, VALUE> extends never ? CHILD_FIELD & WithValue<VALUE> : GetFieldOfType<CHILD_FIELD, VALUE>;

export type ChildControl<
  FIELD_TYPE,
  IDENTIFIER,
  PARENT_FIELD extends MFF,
  CHILD_FIELD extends MFF = ChildField<PARENT_FIELD>
> = FIELD_TYPE extends MFC
  ? FIELD_TYPE
  : FIELD_TYPE extends MFF
  ? MFC<FIELD_TYPE>
  : ControlValue<PARENT_FIELD> extends object
  ? IDENTIFIER extends CHILD_FIELD['name']
    ? MFC<
        ChildFieldFromName<CHILD_FIELD, IDENTIFIER> extends never
          ? FieldWithParentValue<PARENT_FIELD, IDENTIFIER>
          : ChildFieldFromName<PARENT_FIELD, IDENTIFIER>
      >
    : IDENTIFIER extends ControlValueKey<PARENT_FIELD>
    ? MFC<CHILD_FIELD>
    : never
  : never;

type ControlPath = (string | number | MFC | MF)[];

type StateKey = keyof MargaritaFormState;

export interface ControlLike<FIELD extends MFF = MFF, VALUE = ControlValue<FIELD>, CHILD_FIELD extends MFF = ChildField<FIELD>> {
  get<VALUE>(key: keyof MFC | OrString): VALUE;

  cleanup(): void;
  resubscribe(): void;
  updateSyncId(syncId: string): void;
  updateKey(key: string): void;
  get root(): MFC;
  get isRoot(): boolean;
  get parent(): MFC;
  get config(): MargaritaFormConfig;
  get extensions(): MargaritaFormExtensions;
  get locales(): FIELD['locales'];
  get currentLocale(): FIELD['locales'] extends string[] ? FIELD['locales'][number] : undefined;
  get i18n(): FIELD['i18n'];
  get name(): FIELD['name'];
  get index(): number;
  get grouping(): MargaritaFormGroupings;
  get expectArray(): boolean;
  get expectFlat(): boolean;
  get expectGroup(): boolean;
  get expectChildControls(): boolean;

  getManager<MANAGER>(key: string): MANAGER;

  updateField(field: Partial<FIELD>, resetControl: boolean): Promise<void>;
  getPath(outcome?: 'default' | 'keys' | 'controls' | 'uids'): ControlPath;

  // Events

  get changes(): Observable<{ name: keyof MargaritaFormControlManagers; change: unknown; control: MFC<FIELD> }>;

  // Value

  get value(): VALUE;
  set value(value: VALUE);
  get valueChanges(): Observable<VALUE>;

  setValue(value: VALUE | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): void;
  patchValue(value: Partial<VALUE> | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): void;
  dispatchValue(value: VALUE | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): Promise<void>;

  addValue(value: ControlValueItem<FIELD>, mustBeUnique?: boolean, setAsDirty?: boolean, emitEvent?: boolean): void;
  toggleValue(value: ControlValueItem<FIELD>, mustBeUnique?: boolean, setAsDirty?: boolean, emitEvent?: boolean): void;
  removeValue(value: ControlValueItem<FIELD>, setAsDirty?: boolean, emitEvent?: boolean): void;

  // State

  get state(): MargaritaFormState;
  get stateChanges(): Observable<MargaritaFormState>;
  get validators(): MargaritaFormValidators;

  getState<T extends StateKey>(key: T): MargaritaFormState[T];
  getStateChanges<T extends StateKey>(key: T): Observable<MargaritaFormState[T]>;

  enable(): void;
  disable(): void;
  toggleEnabled(): void;
  activate(): void;
  deactivate(): void;
  toggleActive(): void;

  updateStateValue<T extends StateKey>(key: T, value: MargaritaFormState[T]): void;
  updateState: <T extends Partial<MargaritaFormState>>(changes: T) => void;

  validate(setAsTouched?: boolean): Promise<boolean>;
  registerValidator(key: string, validator: MargaritaFormValidator): void;

  get params(): Params;
  get paramsChanges(): Observable<Params>;

  get resolvers(): MargaritaFormResolvers;
  registerResolver(key: string, resolver: MargaritaFormResolver): void;

  // Controls

  get hasControls(): boolean;
  get hasActiveControls(): boolean;
  get controls(): MFC<CHILD_FIELD>[];
  get activeControls(): MFC<CHILD_FIELD>[];

  addControl<CHILD_FIELD extends ChildField<FIELD>>(field: CHILD_FIELD, replaceExisting?: boolean): MFC<CHILD_FIELD>;

  getOrAddControl<CHILD_FIELD extends ChildField<FIELD>>(field: CHILD_FIELD): MFC<CHILD_FIELD>;

  hasControl(identifier: ControlIdentifier): boolean;

  getControl<
    FIELD_TYPE,
    IDENTIFIER extends DeepControlIdentifier<FIELD> = DeepControlIdentifier<FIELD>,
    _T = ChildControl<FIELD_TYPE, IDENTIFIER, FIELD>
  >(
    identifier: IDENTIFIER
  ): ControlValue<FIELD> extends Array<any> ? undefined | _T : _T;

  removeControl: <IDENTIFIER extends DeepControlIdentifier<FIELD> = DeepControlIdentifier<FIELD>>(identifier: IDENTIFIER) => void;
  moveControl: <IDENTIFIER extends DeepControlIdentifier<FIELD> = DeepControlIdentifier<FIELD>>(
    identifier: IDENTIFIER,
    index: number
  ) => void;
  appendControls<CHILD_FIELD extends MFF = FIELD>(fieldTemplates: string[] | CHILD_FIELD[]): MFC<CHILD_FIELD>[];
  appendControl<CHILD_FIELD extends MFF = FIELD>(fieldTemplate?: string | CHILD_FIELD, overrides?: Partial<CHILD_FIELD>): MFC<CHILD_FIELD>;
  remove(): void;
  moveToIndex(index: number): void;

  setRef(ref: any): void;

  get onSubmit(): Observable<MFC<FIELD>>;
  submit<OUTPUT, PARAMS = any>(params?: PARAMS): Promise<OUTPUT>;

  resetValue(): void;
  resetState(respectField?: boolean): void;
  reset(): void;

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
