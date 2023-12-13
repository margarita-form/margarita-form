import { ManagerName } from '../managers/margarita-form-base-manager';
import { MF, MFC, MFF, MFGF, MargaritaFormState } from './margarita-form-types';
import { OrString, OrNumber, OrT } from './util-types';

export type StateKey = keyof MargaritaFormState;
export type ControlPath = (string | number | MFC | MF)[];
export type ControlIdentifier = OrString | OrNumber;

/**
 * Get possible identifiers for a field from parent field.
 */
export type DeepControlIdentifier<
  PARENT_FIELD extends MFF,
  CHILD_FIELD extends MFF = ChildField<PARENT_FIELD>,
  NAME extends string = CHILD_FIELD['name']
> = OrT<NAME> | ControlValueKey<PARENT_FIELD> | ControlIdentifier | ControlIdentifier[];

/**
 * Identify possible types of a field from parent field.
 */
export type ChildField<ParentField extends MFF> = NonNullable<ParentField['fields']>[number];

/**
 * Identify value of a field. Not nullable.
 */
export type ControlValue<Field extends MFF> = NonNullable<Field['initialValue']>;

/**
 * Identify possible values from object field.
 */
export type ControlValueKey<FIELD extends MFF, VALUE = ControlValue<FIELD>> = VALUE extends Array<any> ? PropertyKey : keyof VALUE;

/**
 * Identify possible values from array field.
 */
export type ControlValueItem<Field extends MFF> = ControlValue<Field>[number];

export type ChildFieldFromName<PARENT_FIELD extends MFF, NAME extends string> = Extract<ChildField<PARENT_FIELD>, { name: NAME }>;

/**
 * Identify field's value from parent field.
 */
type ValueFromParent<PARENT_FIELD extends MFF, IDENTIFIER extends PropertyKey> = ControlValue<PARENT_FIELD> extends Record<IDENTIFIER, any>
  ? ControlValue<PARENT_FIELD>[IDENTIFIER]
  : ControlValue<PARENT_FIELD> extends Array<any>
  ? ControlValue<PARENT_FIELD>[number]
  : never;

/**
 * Identifies the type of a child field based on value type.
 */
type GetFieldOfType<FIELD_UNION, VALUE> = Extract<FIELD_UNION, MFF<{ value: VALUE }>>;
type WithValue<VALUE> = { initialValue: VALUE };

/**
 * Identifies the type of a child field based on the parent control and the identifier.
 */
type FieldWithParentValue<
  PARENT_FIELD extends MFF,
  IDENTIFIER extends PropertyKey,
  CHILD_FIELD extends MFF = ChildField<PARENT_FIELD>,
  VALUE = ValueFromParent<PARENT_FIELD, IDENTIFIER>
> = GetFieldOfType<CHILD_FIELD, VALUE> extends never ? CHILD_FIELD & WithValue<VALUE> : GetFieldOfType<CHILD_FIELD, VALUE>;

/**
 * Identifies the type of a child control based on the parent control and the identifier.
 */
export type ChildControl<
  FIELD_TYPE,
  IDENTIFIER,
  PARENT_FIELD extends MFF,
  CHILD_FIELD extends MFF = ChildField<PARENT_FIELD>
> = FIELD_TYPE extends MFC
  ? FIELD_TYPE
  : FIELD_TYPE extends MFF
  ? MFC<FIELD_TYPE>
  : IDENTIFIER extends any[]
  ? MFC<CHILD_FIELD>
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

export type OwnControlChangeName = ManagerName | 'initialize';
export type ChildControlChangeName = `${string}-${OwnControlChangeName}`;
export type ControlChangeName = OwnControlChangeName | ChildControlChangeName;

/**
 * Type of a change event
 */
export type ControlChange<FIELD extends MFF = MFGF, CHANGE = unknown> = {
  name: ControlChangeName;
  change: CHANGE;
  control: MFC<FIELD>;
  origin?: MFC<any>;
};
