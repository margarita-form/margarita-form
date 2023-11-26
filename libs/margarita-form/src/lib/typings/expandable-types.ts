/* eslint-disable @typescript-eslint/no-unused-vars */

export interface FieldParams {
  value?: any;
  fields?: any;
  parent?: any;
}

export interface FieldBase<PARAMS extends FieldParams> {
  [key: string]: any;
}
export interface ControlContext {
  [key: string]: unknown;
}

export interface Managers {
  [key: string]: unknown;
}

export interface Extensions {
  [key: string]: unknown;
}

export type ExtensionName = keyof Extensions;
export type ExtensionsArray = Extensions[ExtensionName][];
