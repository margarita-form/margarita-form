/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BehaviorSubject, Observable } from 'rxjs';
import type { MargaritaFormControl } from './margarita-form-control';
import type { MargaritaForm } from './margarita-form';
import type { MargaritaFormControlManagers } from './managers/margarita-form-default-managers';
import { Params } from './managers/margarita-form-params-manager';
import { MargaritaFormExtensions } from './extensions/margarita-form-extensions';
import {
  MargaritaFormFieldParams,
  MargaritaFormFieldAttributes,
  MargaritaFormResolvers,
  MargaritaFormValidators,
  MargaritaFormFieldValidation,
  MargaritaFormResolver,
  MargaritaFormSubmitHandler,
  MargaritaFormSubmitHandlers,
  MargaritaFormHandleLocalize,
  StorageLike,
  BroadcastLikeConstructor,
  MargaritaFormFieldState,
  MargaritaFormStateErrors,
  MargaritaFormStateAllErrors,
  MargaritaFormStateChildren,
  GenerateKeyFunction,
  MargaritaFormValidator,
} from './typings/core-types';
import {
  ControlValue,
  ChildField,
  ControlPath,
  ControlValueItem,
  StateKey,
  ControlIdentifier,
  DeepControlIdentifier,
  ChildControl,
  I18NField,
  ControlChange,
} from './typings/helper-types';
import { CommonRecord, NotFunction, OrString } from './typings/util-types';

export type MargaritaFormGroupings = 'group' | 'array' | 'flat';

interface MargaritaFormChildField extends MFF {
  name: string;
}

export interface MargaritaFormField<
  VALUE = unknown,
  CHILD_FIELD extends MFF = MargaritaFormChildField,
  LOCALES extends string = never,
  I18N extends object = never
> extends UserDefinedStatesField {
  name: string;
  fields?: CHILD_FIELD[];
  grouping?: MargaritaFormGroupings;
  startWith?: number | (number | string)[];
  initialValue?: VALUE;
  defaultValue?: VALUE;
  valueResolver?: MargaritaFormResolver<VALUE> | NotFunction;
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
  handleSubmit?: string | MargaritaFormSubmitHandler<MFF<VALUE>> | MargaritaFormSubmitHandlers<MFF<VALUE>>;
  locales?: Readonly<LOCALES[]>;
  localize?: LOCALES extends never ? undefined : boolean;
  currentLocale?: LOCALES extends never ? undefined : LOCALES;
  wasLocalized?: boolean;
  isLocaleField?: boolean;
  handleLocalize?: MargaritaFormHandleLocalize;
  i18n?: I18NField<LOCALES, I18N>;
  config?: MargaritaFormConfig;
  useStorage?: false | 'localStorage' | 'sessionStorage' | 'searchParams' | StorageLike;
  useSyncronization?: false | 'broadcastChannel' | BroadcastLikeConstructor;
  context?: CommonRecord;
  __value?: VALUE;
  __i18n?: I18N;
}

export interface UserDefinedStates<TYPE = MargaritaFormFieldState, ALLOW_RESOLVER = false> {
  enabled: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
  disabled: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
  editable: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
  readOnly: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
  active: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
  inactive: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
  hidden: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
  visible: ALLOW_RESOLVER extends true ? TYPE | `$$${string}` : TYPE;
}

export type UserDefinedStatesField = Partial<UserDefinedStates<MargaritaFormFieldState, true>>;

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
  allErrors: MargaritaFormStateAllErrors;
  children?: MargaritaFormStateChildren;
  hasValue?: boolean;
  control?: MFC;
}

export interface MargaritaFormConfig {
  addDefaultValidators?: boolean;
  addMetadata?: boolean;
  allowUnresolvedArrayChildNames?: boolean;
  allowConcurrentSubmits?: boolean;
  asyncFunctionWarningTimeout?: number;
  clearStorageOnSuccessfullSubmit?: boolean;
  appendNodeValidationsToControl?: boolean;
  appendControlValidationsToNode?: boolean;
  resolveNodeTypeValidationsToControl?: boolean;
  disableFormWhileSubmitting?: boolean;
  allowInvalidSubmit?: boolean;
  handleSuccesfullSubmit?: 'disable' | 'enable' | 'reset';
  resetFormOnFieldChanges?: boolean;
  showDebugMessages?: boolean;
  storageKey?: 'key' | 'name' | GenerateKeyFunction;
  storageStrategy?: 'start' | 'end';
  syncronizationKey?: 'key' | 'name' | GenerateKeyFunction;
  transformUndefinedToNull?: boolean;
  allowEmptyString?: boolean;
  localizationOutput?: 'object' | 'array';
  requiredNameCase?: false | 'camel' | 'snake' | 'kebab';
  resolveInitialValuesFromSearchParams?: boolean;
  runTransformersForInitialValues?: boolean;
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

export interface ControlLike<FIELD extends MFF = MFF, VALUE = ControlValue<FIELD>, CHILD_FIELD extends MFF = ChildField<FIELD>> {
  get<VALUE>(key: keyof MFC | OrString): VALUE;

  cleanup(): void;
  reInitialize(): void;
  updateSyncId(): void;
  updateUid(): void;
  updateKey(): void;
  emitChange(name: string, change: unknown): void;
  get root(): MFC;
  get isRoot(): boolean;
  get parent(): MFC;
  get config(): MargaritaFormConfig;
  get extensions(): MargaritaFormExtensions;
  get locales(): Exclude<FIELD['locales'], undefined>;
  get currentLocale(): FIELD['locales'] extends string[] ? FIELD['locales'][number] : undefined;
  get i18n(): FIELD['__i18n'];
  get useStorage(): FIELD['useStorage'];
  get name(): FIELD['name'];
  get index(): number;
  get valueHash(): string;
  get grouping(): MargaritaFormGroupings;
  get expectArray(): boolean;
  get expectFlat(): boolean;
  get expectGroup(): boolean;
  get expectChildControls(): boolean;
  get fields(): CHILD_FIELD[];

  getManager<MANAGER>(key: string): MANAGER;

  setField(field: FIELD, resetControl?: boolean): Promise<void>;
  updateField(field: Partial<FIELD>, resetControl?: boolean): Promise<void>;
  getPath(outcome?: 'default' | 'keys' | 'controls' | 'uids'): ControlPath;

  // Events

  get changes(): BehaviorSubject<ControlChange>;
  get afterChanges(): Observable<ControlChange>;

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
  findControl<
    FIELD_TYPE,
    IDENTIFIER extends DeepControlIdentifier<FIELD> = DeepControlIdentifier<FIELD>,
    _T = ChildControl<FIELD_TYPE, IDENTIFIER, FIELD>
  >(
    identifier: IDENTIFIER
  ): undefined | _T;

  removeControl: <IDENTIFIER extends DeepControlIdentifier<FIELD> = DeepControlIdentifier<FIELD>>(identifier: IDENTIFIER) => void;
  moveControl: <IDENTIFIER extends DeepControlIdentifier<FIELD> = DeepControlIdentifier<FIELD>>(
    identifier: IDENTIFIER,
    index: number
  ) => void;
  appendControls<CHILD_FIELD extends MFF = FIELD>(fieldTemplates: string[] | CHILD_FIELD[]): MFC<CHILD_FIELD>[];
  appendControl<CHILD_FIELD extends MFF = FIELD>(
    fieldTemplate?: string | CHILD_FIELD,
    overrides?: Partial<CHILD_FIELD>
  ): null | MFC<CHILD_FIELD>;
  remove(): void;
  moveToIndex(index: number): void;

  setRef(ref: any): void;

  get onSubmit(): Observable<MFC<FIELD>>;
  submit<OUTPUT, PARAMS = any>(params?: PARAMS): Promise<OUTPUT>;

  resetValue(setDirtyAs?: boolean | undefined, resetChildren?: boolean, origin?: boolean): void;
  clearValue(setDirtyAs?: boolean | undefined, resetChildren?: boolean, origin?: boolean): void;
  resetState(respectField?: boolean, resetChildren?: boolean): void;
  reset(resetChildren?: boolean, origin?: boolean): void;
  clear(resetChildren?: boolean): void;

  getFieldValue<OUTPUT = unknown>(key: keyof FIELD, defaultValue?: OUTPUT): OUTPUT;
}

// Shorthands

/** Shorthand for {@link MargaritaFormField}  */
export type MFF<
  VALUE = any,
  CHILD_FIELD extends MFF = MargaritaFormChildField,
  LOCALES extends string = string,
  I18N extends object = any
> = MargaritaFormField<VALUE, CHILD_FIELD, LOCALES, I18N>;
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

// Export types

export * from './typings/core-types';
export * from './typings/helper-types';
export * from './typings/util-types';
