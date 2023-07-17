import { valueExists } from '../helpers/check-value';
import { MFC, StorageLike } from '../margarita-form-types';
import { LocalStorage } from './storages/local-storage';
import { SearchParamsStorage } from './storages/search-params-storage';
import { SessionStorage } from './storages/session-storage';

export class MargaritaFormStorageExtension<CONTROL extends MFC> {
  private source: StorageLike | undefined;
  public enabled = false;

  constructor(public control: CONTROL) {
    this.source = this._getStorage();
    if (typeof this.source === 'string') throw new Error(`Invalid storage type: ${this.source}`);
    this.enabled = !!this.source;
  }

  private get storageKey(): string {
    if (typeof this.control.config.storageKey === 'function') return this.control.config.storageKey(this.control);
    const storageKey = this.control[this.control.config.storageKey || 'key'];
    if (!storageKey) throw new Error(`Could not get storage key from control!`);
    return storageKey;
  }

  private _getStorage(): StorageLike | undefined {
    const { useStorage } = this.control.field;
    if (useStorage) {
      switch (useStorage) {
        case 'localStorage':
          return LocalStorage;
        case 'sessionStorage':
          return SessionStorage;
        case 'searchParams':
          return SearchParamsStorage;
        default:
          return useStorage;
      }
    }
    return undefined;
  }

  public getStorageValue<TYPE = any>(): TYPE | undefined {
    const key = this.storageKey;
    if (this.source) {
      try {
        const storageValue = this.source.getItem(key);
        if (!storageValue) return undefined;
        if (typeof storageValue === 'string' && /^[{[].+[}\]]$/g.test(storageValue)) return JSON.parse(storageValue);
        return storageValue as TYPE;
      } catch (error) {
        console.error(`Could not get value from ${this.source}!`, { control: this.control, error });
      }
    }
    return undefined;
  }

  public saveStorageValue(value: any): string {
    const key = this.storageKey;
    if (!valueExists(value)) return this.clearStorageValue(key);
    if (this.source) {
      try {
        if (typeof value === 'object') {
          const stringified = JSON.stringify(value);
          return this.saveStorageValue(stringified);
        }

        const validValid = valueExists(value);
        if (!validValid) return this.clearStorageValue(key);
        if (value === '{}') return this.clearStorageValue(key);

        this.source.setItem(key, value);
        return 'saved';
      } catch (error) {
        console.error(`Could not save value to ${this.source}!`, { control: this.control, error });
        return 'error';
      }
    }
    return 'no-storage';
  }

  public clearStorage() {
    this.clearStorageValue(this.storageKey);
  }

  public clearStorageValue(key: string): string {
    if (this.source) {
      try {
        const sessionStorageValue = this.source.getItem(key);
        if (sessionStorageValue) this.source.removeItem(key);
      } catch (error) {
        console.error(`Could not clear value from ${this.source}!`, { control: this.control, error });
      }
    }
    return 'no-storage';
  }
}
