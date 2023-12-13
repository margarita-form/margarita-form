import { Observable } from 'rxjs';
import { MFC } from '../../typings/margarita-form-types';
import { StorageExtensionBase } from './storage-extension-base';

export class BrowserStorageBase extends StorageExtensionBase {
  private storage: Storage | undefined;

  constructor(public override root: MFC, public storageName: 'localStorage' | 'sessionStorage') {
    super(root);
    if (typeof window !== 'undefined') {
      this.storage = window[storageName];
    }
  }

  public override getItem<DATA = string>(key: string): DATA | undefined {
    if (!this.storage) return;
    const value = this.storage.getItem(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as DATA;
    } catch (error) {
      return value as DATA;
    }
  }

  public override setItem<DATA = string>(key: string, value: DATA): void {
    if (!this.storage) return;
    const string = String(value);
    const current = this.storage.getItem(key);
    const changed = current !== string;
    if (!changed) return;
    this.storage.setItem(key, string);
  }
  public override removeItem(key: string): void {
    if (!this.storage) return;
    this.storage.removeItem(key);
  }

  public override listenToChanges<DATA>(key: string): Observable<DATA> {
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

export * from './storage-extension-base';
