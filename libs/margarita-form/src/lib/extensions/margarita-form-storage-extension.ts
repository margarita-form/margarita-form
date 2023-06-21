import { valueExists } from '../helpers/check-value';
import { MFC } from '../margarita-form-types';

export class MargaritaFormStorageExtension<CONTROL extends MFC> {
  private source: Storage | undefined;
  private sourceName: string | undefined;
  public enabled = false;
  private keys: string[] = [];

  constructor(public form: CONTROL) {
    this.source = this._getStorage();
    this.enabled = !!this.source;
  }

  private _getStorage(): Storage | undefined {
    if (typeof window === 'undefined') return undefined;
    const { useStorage } = this.form.config;
    if (useStorage) {
      this.sourceName = useStorage;
      if (useStorage === 'localStorage') {
        return localStorage;
      }
      if (useStorage === 'sessionStorage') {
        return sessionStorage;
      }
    }
    return undefined;
  }

  public getStorageValue<TYPE = any>(key: string): TYPE | undefined {
    if (this.source) {
      try {
        const sessionStorageValue = this.source.getItem(key);
        if (sessionStorageValue) return JSON.parse(sessionStorageValue);
      } catch (error) {
        console.error(`Could not get value from ${this.sourceName}!`, { form: this.form, error });
      }
    }
    return undefined;
  }

  public saveStorageValue(key: string, value: any): string {
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
        this.keys.push(key);
        return 'saved';
      } catch (error) {
        console.error(`Could not save value to ${this.sourceName}!`, { form: this.form, error });
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
        console.error(`Could not clear value from ${this.sourceName}!`, { form: this.form, error });
      }
    }
    return 'no-storage';
  }
}
