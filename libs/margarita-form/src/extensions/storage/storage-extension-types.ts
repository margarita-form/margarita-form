/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, GenerateKeyFunction, MFF } from '../../margarita-form-types';
import { StorageExtensionBase } from './storage-extension-base';

export interface StorageExtensionConfig {
  clearStorageOnSuccessfullSubmit?: boolean;
  storageKey?: 'key' | 'name' | GenerateKeyFunction;
  storageStrategy?: 'start' | 'end';
  resolveInitialValuesFromSearchParams?: boolean;
}

declare module '../../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF = MFF> {
    get storage(): Extensions['storage'];
  }
}

declare module '../../typings/expandable-types' {
  export interface Extensions {
    storage: StorageExtensionBase;
  }

  export interface Configs {
    storage: StorageExtensionConfig;
  }
}
