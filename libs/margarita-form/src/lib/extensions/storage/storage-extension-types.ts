/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable } from 'rxjs';
import { Extensions, MFF } from '../../margarita-form-types';
import { StorageExtensionBase } from './storage-extension-base';

export interface StorageLike {
  getItem(key: string): unknown | undefined;
  setItem(key: string, value: unknown): void;
  removeItem(key: string): void;
  listenToChanges<DATA>(key: string): Observable<DATA>;
}

declare module '../../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF = MFF> {
    get storage(): Extensions['storage'];
  }
}

declare module '../../typings/expandable-types' {
  export interface Extensions {
    storage?: typeof StorageExtensionBase;
  }
}
