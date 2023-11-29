/* eslint-disable @typescript-eslint/no-unused-vars */
import './storage-extension-types';
import { Observable } from 'rxjs';
import { valueExists } from '../../helpers/check-value';
import { ExtensionBase, ExtensionName, Extensions, MFC } from '../../margarita-form-types';
import { MargaritaFormControl } from '../../margarita-form-control';

export class StorageExtensionBase implements ExtensionBase {
  public static extensionName: ExtensionName = 'storage';
  public readonly requireRoot = true;

  constructor(public root: MFC) {
    MargaritaFormControl.extend({
      get storage(): Extensions['storage'] {
        return this.extensions.storage;
      },
    });
  }

  public getItem(key: string): unknown {
    throw new Error('Method not implemented.');
  }

  public setItem(key: string, value: unknown): void {
    throw new Error('Method not implemented.');
  }

  public removeItem(key: string): void {
    throw new Error('Method not implemented.');
  }

  public listenToChanges<DATA>(key: string): any {
    throw new Error('Method not implemented.');
  }

  public get storageKey(): string {
    if (typeof this.root.config.storageKey === 'function') return this.root.config.storageKey(this.root);
    const storageKey = this.root[this.root.config.storageKey || 'key'];
    if (!storageKey) throw new Error(`Could not get storage key from control!`);
    return storageKey;
  }

  public getValueSnapshot = <TYPE = any>(): TYPE | undefined => {
    const key = this.storageKey;
    try {
      const storageValue = this.getItem(key);
      if (!storageValue) return undefined;
      if (typeof storageValue === 'string' && /^[{[].+[}\]]$/g.test(storageValue)) return JSON.parse(storageValue);
      return storageValue as TYPE;
    } catch (error) {
      console.error(`Could not get value!`, { control: this.root, error });
      return undefined;
    }
  };

  public getValueObservable = <TYPE = any>(): Observable<TYPE | undefined> => {
    const key = this.storageKey;
    try {
      return this.listenToChanges<TYPE>(key);
    } catch (error) {
      throw { message: `Could not get value!`, error };
    }
  };

  public handleValueUpdate = (value: any): void => {
    const key = this.storageKey;
    if (!valueExists(value)) return this.clearStorageValue(key);

    try {
      if (typeof value === 'object') {
        const stringified = JSON.stringify(value);
        return this.handleValueUpdate(stringified);
      }

      const validValid = valueExists(value);
      if (!validValid) return this.clearStorageValue(key);
      if (value === '{}') return this.clearStorageValue(key);

      this.setItem(key, value);
    } catch (error) {
      console.error(`Could not save value!`, { control: this.root, error });
    }
  };

  public clearStorage() {
    this.clearStorageValue(this.storageKey);
  }

  public clearStorageValue(key: string): void {
    try {
      const sessionStorageValue = this.getItem(key);
      if (sessionStorageValue) this.removeItem(key);
    } catch (error) {
      console.error(`Could not clear value!`, { control: this.root, error });
    }
  }
}

export * from './storage-extension-types';
