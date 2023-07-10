import { Observable, debounceTime, fromEvent } from 'rxjs';
import { MFC } from '../margarita-form-types';

type Broacaster = BroadcastChannel;

export class MargaritaFormSyncronizationExtension<CONTROL extends MFC> {
  private source: Broacaster | undefined;
  private sourceName: string | undefined;
  public enabled = false;
  private cache = new Map<string, any>();

  constructor(public form: CONTROL) {
    this.source = this._getStorage();
    this.enabled = !!this.source;
  }

  private _getStorage(): Broacaster | undefined {
    if (typeof window === 'undefined') return undefined;
    const { useSyncronization } = this.form.config;
    if (useSyncronization) {
      this.sourceName = useSyncronization;
      if (useSyncronization === 'broadcastChannel') {
        if (typeof BroadcastChannel === 'undefined') return undefined;
        return new BroadcastChannel(`margarita-form-${this.form.name}`);
      }
    }
    return undefined;
  }

  public broadcastChange<DATA = any>(key: string, value: DATA): void {
    if (!this.source) return console.warn('Trying to start syncronization without a source!');
    const cachedValue = this.cache.get(key);
    const valueChanged = JSON.stringify(value) !== JSON.stringify(cachedValue);
    if (!valueChanged) return;
    this.cache.set(key, value);
    this.source.postMessage({ key, value });
  }

  public subscribeToMessages<DATA = any>(
    key: string,
    callback: (message: DATA) => void | Promise<void>,
    getCurrent: () => DATA
  ): void | { observable: Observable<MessageEvent>; handler: (event: MessageEvent<any>) => void } {
    if (!this.source) return console.warn('Trying to start syncronization without a source!');
    this.source.postMessage({ key, requestSend: true });

    const observable = fromEvent<MessageEvent>(this.source, 'message').pipe(debounceTime(10));

    const handler = (event: MessageEvent<any>) => {
      if (!this.source) return console.warn('Trying to start syncronization without a source!');
      const value = getCurrent();
      if (event.data.requestSend) {
        this.source.postMessage({ key, value });
      } else if (event.data.key === key) {
        const valueChanged = JSON.stringify(event.data.value) !== JSON.stringify(value);
        if (valueChanged) {
          callback(event.data.value);
          this.cache.set(key, event.data.value);
        }
      }
    };

    return {
      observable,
      handler,
    };
  }
}
