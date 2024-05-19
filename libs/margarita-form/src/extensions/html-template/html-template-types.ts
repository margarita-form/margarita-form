/* eslint-disable @typescript-eslint/no-unused-vars */
import { FieldParams } from '../../typings/margarita-form-types';
import { HTMLTemplateExtension } from './html-template-extension';
export type __FORCE_IMPORT_FIELD_PARAMS = FieldParams; // This is used to force import FieldParams type from the typings

declare module '@margarita-form/core' {
  export interface Extensions {
    htmlTemplate: HTMLTemplateExtension;
  }

  export interface FieldBase<PARAMS extends FieldParams> {
    htmlTemplate?: string;
  }
}
