export class SearchParamsStorage {
  public static serverHref: string | undefined;

  public static get url(): URL | null {
    if (typeof window !== 'undefined' && this.serverHref) new URL(this.serverHref);
    return typeof window !== 'undefined' ? new URL(window.location.href) : null;
  }

  public static getItem(key: string): string | undefined {
    const url = this.url;
    if (!url) return;
    return url.searchParams.get(key) || undefined;
  }

  public static setItem(key: string, value: string): void {
    const url = this.url;
    if (!url) return;
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url.href);
  }

  public static removeItem(key: string): void {
    const url = this.url;
    if (!url) return;
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url.href);
  }
}
