/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTMLTemplateExtension } from './html-template-extension';

declare module '../../typings/expandable-types' {
  export interface Extensions {
    htmlTemplate: HTMLTemplateExtension;
  }

  export interface FieldBase<PARAMS extends FieldParams> {
    htmlTemplate?: string;
  }
}
