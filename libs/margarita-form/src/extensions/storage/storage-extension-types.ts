/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, GenerateKeyFunction, MFF, MFGF } from '../../typings/margarita-form-types';
import { StorageExtensionBase } from './storage-extension-base';

export interface StorageExtensionConfig {
  clearStorageOnSuccessfullSubmit?: boolean;
  storageKey?: 'key' | 'name' | GenerateKeyFunction;
  storageStrategy?: 'start' | 'end' | 'manual';
  resolveInitialValuesFromSearchParams?: boolean;
  saveDefaultValue?: boolean;
}

declare module '../../typings/expandable-types' {
  export interface ControlBase<FIELD extends MFF> {
    get storage(): Extensions['storage'];
  }

  export interface FieldBase<PARAMS extends FieldParams> {
    storage?: boolean;
  }

  export interface Extensions {
    storage: StorageExtensionBase;
  }

  export interface Configs {
    storage: StorageExtensionConfig;
  }
}
