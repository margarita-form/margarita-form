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

export class ExtensionBase {
  public static extensionName: ExtensionName;
  readonly requireRoot!: boolean;
  constructor(public root: MFC) {}
  // Value manager
  getValueObservable?: <T>(control: MFC) => Observable<T | undefined>;
  handleValueUpdate?: <T>(value: T) => void | Promise<void>;
  getValueSnapshot?: <T>() => T | undefined;
  // Control manager
  modifyField?: (field: any, parentControl: MFC) => any;
}

export type ExtensionInstanceLike = InstanceType<typeof ExtensionBase>;

export interface Extensions {
  [key: string]: unknown;
}

export type ExtensionName = keyof Extensions;
export type ExtensionInstances = ExtensionInstanceLike[];
export type ExtensionsArray = Extensions[ExtensionName][];
