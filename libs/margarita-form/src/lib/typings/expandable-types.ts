/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable } from 'rxjs';
import { MFC } from '../margarita-form-types';

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

export interface ExtensionLike {
  requireRoot: boolean;
  getValueObservable?: <T>(control: MFC) => Observable<T>;
  handleValueUpdate?: <T>(value: T) => void;
  getValueSnapshot?: <T>() => T;
}

export interface Extensions {
  [key: string]: unknown;
}

export type ExtensionName = keyof Extensions;
export type ExtensionsArray = Extensions[ExtensionName][];
