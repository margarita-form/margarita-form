/* eslint-disable @typescript-eslint/no-unused-vars */

import { ExtensionName } from './derived-types';

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

export interface Configs {
  //
}
