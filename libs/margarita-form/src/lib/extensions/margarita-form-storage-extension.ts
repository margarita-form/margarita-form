import { valueExists } from '../helpers/check-value';
import { MFC, StorageLike } from '../margarita-form-types';
import { LocalStorage } from './storages/local-storage';
import { SearchParamsStorage } from './storages/search-params-storage';
import { SessionStorage } from './storages/session-storage';

export class MargaritaFormStorageExtension<CONTROL extends MFC> {
  private source: StorageLike | undefined;
  public enabled = false;
  private keys = new Set<string>();

  constructor(public form: CONTROL) {
    this.source = this._getStorage();
    if (typeof this.source === 'string') throw new Error(`Invalid storage type: ${this.source}`);
    this.enabled = !!this.source;
  }

  private _getStorage(): StorageLike | undefined {
    if (typeof window === 'undefined') return undefined;
    const { useStorage } = this.form.config;
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

  public getStorageValue<TYPE = any>(key: string): TYPE | undefined {
    if (this.source) {
      try {
        const storageValue = this.source.getItem(key);
        if (!storageValue) return undefined;
        if (typeof storageValue === 'string') return JSON.parse(storageValue);
        return storageValue as TYPE;
      } catch (error) {
        console.error(`Could not get value from ${this.source}!`, { form: this.form, error });
      }
    }
    return undefined;
  }

  public saveStorageValue(key: string, value: any): string {
    if (!valueExists(value)) return this.clearStorageValue(key);
    if (this.source) {
      try {
        if (typeof value === 'object') {
          const stringified = JSON.stringify(value);
          return this.saveStorageValue(key, stringified);
        }

        const validValid = valueExists(value);
        if (!validValid) return this.clearStorageValue(key);
        if (value === '{}') return this.clearStorageValue(key);

        this.source.setItem(key, value);
        this.addStorageKey(key);
        return 'saved';
      } catch (error) {
        console.error(`Could not save value to ${this.source}!`, { form: this.form, error });
        return 'error';
      }
    }
    return 'no-storage';
  }

  public clearStorage() {
    this.keys.forEach((key) => this.clearStorageValue(key));
  }

  public clearStorageValue(key: string): string {
    if (this.source) {
      try {
        const sessionStorageValue = this.source.getItem(key);
        if (sessionStorageValue) this.source.removeItem(key);
      } catch (error) {
        console.error(`Could not clear value from ${this.source}!`, { form: this.form, error });
      }
    }
    return 'no-storage';
  }

  private addStorageKey(key: string) {
    this.keys.add(key);
  }
}
