import { Observable } from 'rxjs';
import { BroadcastLike, BroadcasterMessage, MFC } from '../margarita-form-types';
import { BrowserBroadcastChannel } from './broadcasters/browser-broadcast-channel';

export class MargaritaFormSyncronizationExtension<CONTROL extends MFC> {
  private source: BroadcastLike | undefined;
  public enabled = false;
  private cache = new Map<string, any>();

  constructor(public control: CONTROL) {
    this.source = this._getSyncApi();
    this.enabled = !!this.source;
  }

  private get syncronizationKey(): string {
    if (typeof this.control.config.syncronizationKey === 'function') return this.control.config.syncronizationKey(this.control);
    const syncronizationKey = this.control[this.control.config.syncronizationKey || 'key'];
    if (!syncronizationKey) throw new Error(`Could not get syncronization key from control!`);
    return syncronizationKey;
  }

  private _getSyncApi(): BroadcastLike | undefined {
    const { useSyncronization } = this.control.field;
    if (useSyncronization) {
      const getApi = () => {
        switch (useSyncronization) {
          case 'broadcastChannel':
            return BrowserBroadcastChannel;
          default:
            return useSyncronization;
        }
      };

      const api = getApi();
      if (!api) return undefined;
      const key = this.syncronizationKey;
      return new api(key, this.control);
    }
    return undefined;
  }

  public broadcastChange<DATA = any>(value: DATA): void {
    if (!this.source) return console.warn('Trying to start syncronization without a source!');
    const key = this.syncronizationKey;
    const cachedValue = this.cache.get(key);
    const valueChanged = JSON.stringify(value) !== JSON.stringify(cachedValue);
    if (!valueChanged) return;
    this.cache.set(key, value);
    this.source.postMessage({ key, value });
  }

  public subscribeToMessages<DATA = any>(
    callback: (message: DATA) => void | Promise<void>,
    getCurrent: () => DATA
  ): void | { observable: void | Observable<BroadcasterMessage<DATA>>; handler: (event: BroadcasterMessage<DATA>) => void } {
    const key = this.syncronizationKey;
    if (!this.source) return console.warn('Trying to start syncronization without a source!');
    this.source.postMessage({ key, requestSend: true });

    const observable = this.source.listenToMessages<DATA>();

    const handler = (message: BroadcasterMessage<DATA>) => {
      if (!this.source) return console.warn('Trying to start syncronization without a source!');
      const value = getCurrent();
      if (message.requestSend) {
        this.source.postMessage({ key, value });
      } else if (message.key === key) {
        const valueChanged = JSON.stringify(message.value) !== JSON.stringify(value);
        if (valueChanged) {
          callback(message.value as DATA);
          this.cache.set(key, message.value);
        }
      }
    };

    return {
      observable,
      handler,
    };
  }
}
