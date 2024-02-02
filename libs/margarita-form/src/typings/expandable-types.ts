/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { FieldName, MFF, MFGF } from './margarita-form-types';

export interface FieldParams {
  value?: any;
  fields?: MFGF;
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

export class ControlBase<FIELD extends MFF> {
  //
}
