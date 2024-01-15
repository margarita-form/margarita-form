/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BehaviorSubject, Observable } from 'rxjs';
import type { MargaritaFormControl } from '../margarita-form-control';
import type { MargaritaForm } from '../margarita-form';
import {
  MargaritaFormFieldAttributes,
  MargaritaFormResolvers,
  MargaritaFormValidators,
  MargaritaFormFieldValidation,
  MargaritaFormResolver,
  MargaritaFormSubmitHandler,
  MargaritaFormSubmitHandlers,
  MargaritaFormFieldState,
  MargaritaFormStateErrors,
  MargaritaFormStateAllErrors,
  MargaritaFormStateChildren,
  MargaritaFormValidator,
  ControlContext,
} from './core-types';
import {
  ControlValue,
  ChildField,
  ControlPath,
  ControlValueItem,
  StateKey,
  ControlIdentifier,
  DeepControlIdentifier,
  ChildControl,
  ControlChange,
  ControlChangeName,
} from './helper-types';
import { NotFunction, OrAny, OrString, ReplaceAny } from './util-types';
import { Configs, Context, Extensions, FieldBase, FieldParams, Managers } from './expandable-types';
import { ExtensionInstanceLike, ExtensionsArray } from './derived-types';
import { CoreGetter } from '../helpers/core-resolver';

export type MargaritaFormGroupings = 'group' | 'array' | 'flat';

export type FieldName = CoreGetter<string>;
export type FieldChild<FIELD extends MFF> = CoreGetter<FIELD>;
export type FieldValue<VALUE = unknown> = CoreGetter<VALUE>;
export type StartWith = number | (number | string)[];

export interface MargaritaFormField<FP extends FieldParams = FieldParams> extends FieldBase<FP>, UserDefinedStatesField {
  name: FP['name'] extends FieldName ? FP['name'] : FieldName;
  fields?: FieldChild<MFGF & FP['fields']>[];
  grouping?: CoreGetter<MargaritaFormGroupings>;
  startWith?: CoreGetter<StartWith>;
  initialValue?: FieldValue<ReplaceAny<FP['value']>>;
  defaultValue?: FieldValue<ReplaceAny<FP['value']>>;
  valueResolver?: MargaritaFormResolver<FP['value']> | NotFunction;
  attributes?: MargaritaFormFieldAttributes;
  resolvers?: MargaritaFormResolvers;
  validators?: MargaritaFormValidators;
  validation?: MargaritaFormFieldValidation<FP['value']>;
  dispatcher?: MargaritaFormResolver<FP['value']> | NotFunction;
  transformer?: MargaritaFormResolver<FP['value']>;
  beforeSubmit?: MargaritaFormResolver;
  afterSubmit?: MargaritaFormResolver;
  onCreate?: MargaritaFormResolver;
  onRemove?: MargaritaFormResolver;
  onChanges?: MargaritaFormResolver;
  onValueChanges?: MargaritaFormResolver;
  onStateChanges?: MargaritaFormResolver;
  onChildControlChanges?: MargaritaFormResolver;
  handleSubmit?:
    | string
    | MargaritaFormSubmitHandler<MFGF<{ value: FP['value'] }>>
    | MargaritaFormSubmitHandlers<MFGF<{ value: FP['value'] }>>;
  config?: MargaritaFormConfig;
  context?: Context;
  managers?: Partial<Managers>;
  extensions?: ExtensionsArray;
  __params?: FP;
  __value?: FP['value'];
  __fields?: FP['fields'] extends object ? FP['fields'][] : MFGF[];
}

interface MargaritaFormGeneralField<FP extends FieldParams = any> extends MFF<FP> {
  [key: string]: OrAny;
}

type UserDefinedStateResolver<TYPE = MargaritaFormFieldState> = TYPE | `$$${string}`;

export interface UserDefinedStates<TYPE = unknown> {
  enabled: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
  disabled: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
  editable: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
  readOnly: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
  active: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
  inactive: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
  hidden: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
  visible: TYPE extends unknown ? UserDefinedStateResolver : TYPE;
}

export type UserDefinedStatesField = Partial<UserDefinedStates>;

export interface MargaritaFormState extends UserDefinedStates<boolean> {
  pristine: boolean;
  dirty: boolean;
  untouched: boolean;
  focus: boolean;
  touched: boolean;
  valueChanged: boolean;
  validating: boolean;
  validated: boolean;
  valid: boolean;
  invalid: boolean;
  shouldShowError: undefined | boolean;
  submitting: boolean;
  submitted: boolean;
  submits: number;
  submitResult: 'not-submitted' | 'form-invalid' | 'error' | 'success';
  submitOutput: unknown;
  errors: MargaritaFormStateErrors;
  allErrors: MargaritaFormStateAllErrors;
  children?: MargaritaFormStateChildren;
  hasValue?: boolean;
  control?: MFC;
  parentIsActive?: boolean;
  [key: string]: any;
}

export interface MargaritaFormConfig extends Partial<Configs> {
  addMetadata?: boolean;
  afterChangesDebounceTime?: number;
  allowUnresolvedArrayChildNames?: boolean;
  allowConcurrentSubmits?: boolean;
  allowValueToBeFunction?: boolean;
  asyncFunctionWarningTimeout?: number;
  appendNodeValidationsToControl?: boolean;
  appendControlValidationsToNode?: boolean;
  resolveNodeTypeValidationsToControl?: boolean;
  disableFormWhileSubmitting?: boolean;
  allowInvalidSubmit?: boolean;
  handleSuccesfullSubmit?: 'disable' | 'reset' | 'reset-value' | 'reset-state' | 'none';
  resetFormOnFieldChanges?: boolean;
  showDebugMessages?: boolean;
  transformUndefinedToNull?: boolean;
  allowEmptyString?: boolean;
  requiredNameCase?: false | 'camel' | 'snake' | 'kebab';
  runTransformersForInitialValues?: boolean;
}

export type MargaritaFormBaseElement<CONTROL extends MFC = MFC<MFGF>, NODE extends HTMLElement = HTMLElement> = NODE & {
  controls?: CONTROL[];
  value?: unknown;
  checked?: boolean;
  files?: FileList;
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
  emitChange(name: ControlChangeName, change: unknown, origin?: MFC<any>): void;
  get root(): MFC;
  get isRoot(): boolean;
  get parent(): MFC;
  get config(): MargaritaFormConfig;
  get extensions(): Extensions;
  get activeExtensions(): ExtensionInstanceLike[];
  get name(): FIELD['name'] extends string ? FIELD['name'] : string;
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
  get fieldChanges(): Observable<FIELD>;

  // Events

  get changes(): BehaviorSubject<ControlChange>;
  get ownChanges(): Observable<ControlChange>;
  get childChanges(): Observable<ControlChange>;
  get afterChanges(): Observable<ControlChange>;

  // Value

  get value(): VALUE;
  set value(value: VALUE);
  get valueChanges(): Observable<VALUE>;

  setValue(value: VALUE | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): void;
  patchValue(value: Partial<VALUE> | undefined | null, setAsDirty?: boolean, emitEvent?: boolean): void;
  dispatch(action: VALUE | OrAny, setAsDirty?: boolean, emitEvent?: boolean): Promise<void>;

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

  updateStateValue<T extends StateKey>(key: T, value: MargaritaFormState[T]): Promise<boolean>;
  updateState: <T extends Partial<MargaritaFormState>>(changes: T) => Promise<boolean>;

  validate(setAsTouched?: boolean): Promise<boolean>;
  registerValidator(key: string, validator: MargaritaFormValidator): void;

  get resolvers(): MargaritaFormResolvers;
  registerResolver(key: string, resolver: MargaritaFormResolver): void;

  // Controls

  get hasControls(): boolean;
  get hasActiveControls(): boolean;
  get controls(): MFC<CHILD_FIELD>[];
  get activeControls(): MFC<CHILD_FIELD>[];

  getSiblings<SIBLING_FIELD extends MFF = MFGF>(): MFC<SIBLING_FIELD>[];
  getActiveSiblings<SIBLING_FIELD extends MFF = MFGF>(): MFC<SIBLING_FIELD>[];
  getSibling<SIBLING_FIELD extends MFF = MFGF>(identifier: ControlIdentifier): MFC<SIBLING_FIELD>;

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
  queryControls<RESULT_FIELD extends MFF = MFGF>(query: (control: MFC<MFGF>) => boolean, recursive?: boolean): MFC<RESULT_FIELD>[];

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
  submit<OUTPUT, PARAMS = object>(params?: PARAMS): Promise<OUTPUT>;

  resetValue(setDirtyAs?: boolean | undefined, resetChildren?: boolean, origin?: boolean): void;
  clearValue(setDirtyAs?: boolean | undefined, resetChildren?: boolean, origin?: boolean): void;
  resetState(respectField?: boolean, resetChildren?: boolean): void;
  reset(resetChildren?: boolean, origin?: boolean): void;
  clear(resetChildren?: boolean): void;

  getFieldValue<OUTPUT = unknown>(key: keyof FIELD, defaultValue?: OUTPUT): OUTPUT;
  get context(): ControlContext<MFC<FIELD>, never>;
}

// Shorthands

/** Shorthand for {@link MargaritaFormField}  */
export type MFF<FP extends FieldParams = FieldParams> = MargaritaFormField<FP>;
/** Shorthand for {@link MargaritaFormGeneralField} */
export type MFGF<FP extends FieldParams = FieldParams> = MargaritaFormGeneralField<FP>;
/** Shorthand for {@link MargaritaForm}  */
export type MF<FIELD extends MFF<any> = MFGF> = MargaritaForm<FIELD>;
/** Shorthand for {@link MargaritaFormControl}  */
export type MFC<FIELD extends MFF<any> = MFGF> = MargaritaFormControl<FIELD>;
/** Shorthand for {@link MargaritaFormBaseElement}  */
export type MFBE<CONTROL extends MFC = MFC<MFGF>> = MargaritaFormBaseElement<CONTROL>;
/** Margarita form controls as group */
export type MFCG<FIELD extends MFF<any> = MFGF> = Record<string, MFC<FIELD>>;
/** Margarita form controls as array */
export type MFCA<FIELD extends MFF<any> = MFGF> = MFC<FIELD>[];
/** Get child control */
export type MFCCF<FIELD extends MFF<any>> = MFC<ChildField<FIELD>>;

// Export types

export * from './core-types';
export * from './expandable-types';
export * from './helper-types';
export * from './util-types';
export * from './derived-types';
