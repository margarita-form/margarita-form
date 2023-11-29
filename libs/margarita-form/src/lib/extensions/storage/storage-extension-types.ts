/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, MFF } from '../../margarita-form-types';
import { StorageExtensionBase } from './storage-extension-base';

declare module '../../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF = MFF> {
    get storage(): Extensions['storage'];
  }
}

declare module '../../typings/expandable-types' {
  export interface Extensions {
    storage: StorageExtensionBase;
  }
}
