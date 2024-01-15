/* eslint-disable @typescript-eslint/no-unused-vars */

import { FieldName, MFGF } from './margarita-form-types';

export interface FieldParams {
  value?: any;
  fields?: unknown;
  parent?: any;
  name?: FieldName;
}

export interface FieldBase<PARAMS extends FieldParams> {
  // Empty by default
}
export interface Context {
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
