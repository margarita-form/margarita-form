/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable } from 'rxjs';
import { valueExists } from '../../helpers/check-value';
import { ExtensionName, Extensions, MFC } from '../../margarita-form-types';
import { ValueManager } from '../../managers/margarita-form-value-manager';
import { StorageLike } from './storage-extension-types';
import { MargaritaFormControl } from '../../margarita-form-control';

export class StorageExtensionBase implements StorageLike {
  public static extensionName: ExtensionName = 'storage';
  public static source: StorageLike;

  constructor(public control: MFC) {
    MargaritaFormControl.extend({
      get storage(): Extensions['storage'] {
        return this.extensions.storage;
      },
    });

    ValueManager.addValueGetter({
      name: 'storage',
      getSnapshot: () => this.getStorageValue(),
      getObservable: () => this.getStorageValueListener(),
      setValue: (value) => this.saveStorageValue(value),
    });
  }

  getItem(key: string): unknown {
    throw new Error('Method not implemented.');
  }

  setItem(key: string, value: unknown): void {
    throw new Error('Method not implemented.');
  }

  removeItem(key: string): void {
    throw new Error('Method not implemented.');
  }

  listenToChanges<DATA>(key: string): any {
    throw new Error('Method not implemented.');
  }

  public get storageKey(): string {
    if (typeof this.control.config.storageKey === 'function') return this.control.config.storageKey(this.control);
    const storageKey = this.control[this.control.config.storageKey || 'key'];
    if (!storageKey) throw new Error(`Could not get storage key from control!`);
    return storageKey;
  }

  public getStorageValue<TYPE = any>(): TYPE | undefined {
    const key = this.storageKey;
    try {
      const storageValue = this.getItem(key);
      if (!storageValue) return undefined;
      if (typeof storageValue === 'string' && /^[{[].+[}\]]$/g.test(storageValue)) return JSON.parse(storageValue);
      return storageValue as TYPE;
    } catch (error) {
      console.error(`Could not get value!`, { control: this.control, error });
      return undefined;
    }
  }

  public getStorageValueListener<TYPE = any>(): Observable<TYPE | undefined> {
    const key = this.storageKey;
    try {
      return this.listenToChanges<TYPE>(key);
    } catch (error) {
      throw { message: `Could not get value!`, error };
    }
  }

  public saveStorageValue(value: any): void {
    const key = this.storageKey;
    if (!valueExists(value)) return this.clearStorageValue(key);

    try {
      if (typeof value === 'object') {
        const stringified = JSON.stringify(value);
        return this.saveStorageValue(stringified);
      }

      const validValid = valueExists(value);
      if (!validValid) return this.clearStorageValue(key);
      if (value === '{}') return this.clearStorageValue(key);

      this.setItem(key, value);
    } catch (error) {
      console.error(`Could not save value!`, { control: this.control, error });
    }
  }

  public clearStorage() {
    this.clearStorageValue(this.storageKey);
  }

  public clearStorageValue(key: string): void {
    try {
      const sessionStorageValue = this.getItem(key);
      if (sessionStorageValue) this.removeItem(key);
    } catch (error) {
      console.error(`Could not clear value!`, { control: this.control, error });
    }
  }
}