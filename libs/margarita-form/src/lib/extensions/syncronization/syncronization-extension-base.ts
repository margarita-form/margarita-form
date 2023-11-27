/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable } from 'rxjs';
import { ExtensionName, Extensions, MFC } from '../../margarita-form-types';
import { BroadcastLike, BroadcasterMessage } from './syncronization-extension-types';
import { MargaritaFormControl } from '../../margarita-form-control';

export class SyncronizationExtensionBase implements BroadcastLike {
  public static extensionName: ExtensionName = 'syncronization';
  private cache = new Map<string, string>();

  constructor(public root: MFC) {
    MargaritaFormControl.extend({
      get syncronization(): Extensions['syncronization'] {
        return this.extensions.syncronization;
      },
    });
  }

  public postMessage(message: BroadcasterMessage): void {
    throw new Error('Method not implemented.');
  }

  public listenToMessages<DATA>(): void | Observable<BroadcasterMessage<DATA>> {
    throw new Error('Method not implemented.');
  }

  private get syncronizationKey(): string {
    if (typeof this.root.config.syncronizationKey === 'function') return this.root.config.syncronizationKey(this.root);
    const syncronizationKey = this.root[this.root.config.syncronizationKey || 'key'];
    if (!syncronizationKey) throw new Error(`Could not get syncronization key from control!`);
    return syncronizationKey;
  }

  public broadcastChange<DATA = any>(value: DATA): void {
    const key = this.syncronizationKey;
    const cachedValue = this.cache.get(key);
    const valueChanged = JSON.stringify(value) !== cachedValue;

    if (!valueChanged) return;
    this.cache.set(key, JSON.stringify(value));
    this.postMessage({ key, value, uid: this.root.uid });
  }

  public subscribeToMessages<DATA = any>(
    callback: (message: DATA) => void | Promise<void>,
    getCurrent: () => DATA
  ): void | { observable: void | Observable<BroadcasterMessage<DATA>>; handler: (event: BroadcasterMessage<DATA>) => void } {
    const key = this.syncronizationKey;
    this.postMessage({ key, uid: this.root.uid, requestSend: true });

    const observable = this.listenToMessages<DATA>();

    const handler = (message: BroadcasterMessage<DATA>) => {
      if (message.uid === this.root.uid) return;
      const value = getCurrent();
      if (message.requestSend) {
        this.postMessage({ key, value, uid: this.root.uid });
      } else if (message.key === key) {
        const valueChanged = JSON.stringify(message.value) !== JSON.stringify(value);
        if (valueChanged) {
          callback(message.value as DATA);
          this.cache.set(key, JSON.stringify(message.value));
        }
      }
    };

    return {
      observable,
      handler,
    };
  }
}
