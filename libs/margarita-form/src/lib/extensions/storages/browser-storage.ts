import { Observable } from 'rxjs';
import { StorageLike } from '../../margarita-form-types';

class BrowserStorageBase implements StorageLike {
  private storage: Storage | undefined;

  constructor(storageName: 'localStorage' | 'sessionStorage') {
    if (typeof window !== 'undefined') {
      this.storage = window[storageName];
    }
  }

  getItem<DATA = string>(key: string): DATA | undefined {
    if (!this.storage) return;
    const value = this.storage.getItem(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as DATA;
    } catch (error) {
      return value as DATA;
    }
  }

  public setItem<DATA = string>(key: string, value: DATA): void {
    if (!this.storage) return;
    const string = String(value);
    const current = this.storage.getItem(key);
    const changed = current !== string;
    if (!changed) return;
    this.storage.setItem(key, string);
  }
  public removeItem(key: string): void {
    if (!this.storage) return;
    this.storage.removeItem(key);
  }

  public listenToChanges<DATA>(key: string): Observable<DATA> {
    return new Observable((subscriber) => {
      if (typeof window === 'undefined') return;
      const listener = () => {
        const value = this.getItem<DATA>(key);
        return subscriber.next(value);
      };
      window.addEventListener('storage', listener);
      return () => window.removeEventListener('storage', listener);
    });
  }
}

const BrowserStorage = {
  create(storageName: 'localStorage' | 'sessionStorage'): StorageLike {
    return new BrowserStorageBase(storageName);
  },
};

export default BrowserStorage;
