/* eslint-disable @typescript-eslint/no-unused-vars */
import { CoreGetterContext } from '../../helpers/core-resolver';
import { MFGF } from '../../typings/margarita-form-types';
import { FieldModifiersExtension } from './field-modifiers-extension';

export type ModifierConditionFn = (context: CoreGetterContext) => boolean;
export type FieldModifierFn = (context: CoreGetterContext) => Partial<MFGF<any>>;

export type FieldModifier =
  | FieldModifierFn
  | {
      condition: ModifierConditionFn;
      modifier: FieldModifierFn;
    };

export type FieldModifiers = FieldModifier[];

declare module '../../typings/expandable-types' {
  export interface Extensions {
    fieldModifiers: FieldModifiersExtension;
  }
  export interface FieldBase<PARAMS extends FieldParams> {
    fieldModifiers?: FieldModifiers;
  }
}
