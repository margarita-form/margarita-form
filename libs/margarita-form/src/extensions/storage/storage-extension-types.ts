/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, GenerateKeyFunction, MFF } from '../../typings/margarita-form-types';
import { StorageExtensionBase } from './storage-extension-base';

export interface StorageExtensionConfig {
  clearStorageOnSuccessfullSubmit?: boolean;
  storageKey?: 'key' | 'name' | GenerateKeyFunction;
  storageStrategy?: 'start' | 'end' | 'manual';
  resolveInitialValuesFromSearchParams?: boolean;
}

declare module '../../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF<any> = MFF> {
    get storage(): Extensions['storage'];
  }
}

declare module '../../typings/expandable-types' {
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
