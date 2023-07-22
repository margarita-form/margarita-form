import { Observable } from 'rxjs';

export class SearchParamsStorage {
  public static serverHref: string | undefined;

  public static get url(): URL | null {
    if (typeof window !== 'undefined' && this.serverHref) new URL(this.serverHref);
    return typeof window !== 'undefined' ? new URL(window.location.href) : null;
  }

  public static getItem<DATA = string>(key: string): DATA | undefined {
    const url = this.url;
    if (!url) return;
    const value = url.searchParams.get(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as DATA;
    } catch (error) {
      return value as DATA;
    }
  }

  public static setItem<DATA = string>(key: string, value: DATA): void {
    const url = this.url;
    if (!url) return;
    const string = String(value);
    const current = url.searchParams.get(key);
    const changed = current !== string;
    if (!changed) return;
    url.searchParams.set(key, string);
    window.history.pushState({}, '', url.href);
  }

  public static removeItem(key: string): void {
    const url = this.url;
    if (!url) return;
    url.searchParams.delete(key);
    window.history.pushState({}, '', url.href);
  }

  public static listenToChanges<DATA>(key: string): Observable<DATA> {
    return new Observable((subscriber) => {
      if (typeof window === 'undefined') return;
      const listener = () => {
        const value = this.getItem<DATA>(key);
        return subscriber.next(value);
      };
      window.addEventListener('popstate', listener);
      return () => window.removeEventListener('popstate', listener);
    });
  }
}
