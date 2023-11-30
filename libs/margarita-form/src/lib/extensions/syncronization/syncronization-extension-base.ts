/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable, filter, map } from 'rxjs';
import { ExtensionName, Extensions, MFC } from '../../margarita-form-types';
import { BroadcasterMessage } from './syncronization-extension-types';
import { MargaritaFormControl } from '../../margarita-form-control';
import { isEqual } from '../../helpers/check-value';
import { ExtensionBase } from '../base/extension-base';

export class SyncronizationExtensionBase extends ExtensionBase<any> {
  public static extensionName: ExtensionName = 'syncronization';
  public readonly requireRoot = true;
  public readonly cache = new Map<string, string>();

  constructor(public override root: MFC) {
    super(root);
    MargaritaFormControl.extend({
      get syncronization(): Extensions['syncronization'] {
        return this.extensions.syncronization;
      },
    });
  }

  public postMessage(message: BroadcasterMessage): void {
    throw new Error('Method not implemented.');
  }

  public listenToMessages<DATA>(): Observable<BroadcasterMessage<DATA>> {
    throw new Error('Method not implemented.');
  }

  private get syncronizationKey(): string {
    if (typeof this.root.config.syncronizationKey === 'function') return this.root.config.syncronizationKey(this.root);
    const syncronizationKey = this.root[this.root.config.syncronizationKey || 'key'];
    if (!syncronizationKey) throw new Error(`Could not get syncronization key from control!`);
    return syncronizationKey;
  }

  public handleValueUpdate = <DATA = any>(value: DATA): void => {
    const key = this.syncronizationKey;
    const cachedValue = this.cache.get(key);
    const changed = !isEqual(value, cachedValue);
    if (changed) {
      const asString = JSON.stringify(value);
      this.cache.set(key, asString);
      this.postMessage({ key, value: value, uid: this.root.uid });
    }
  };

  public getValueObservable = <DATA = any>(control: MFC): Observable<DATA | undefined> => {
    const key = this.syncronizationKey;
    this.postMessage({ key, uid: this.root.uid, requestSend: true });
    const observable = this.listenToMessages<DATA>();
    return observable.pipe(
      filter((message) => {
        const asString = JSON.stringify(message.value);
        const cacheValue = this.cache.get(key);
        if (message.key !== key) return false;
        if (message.uid === this.root.uid) return false;
        if (message.requestSend) {
          this.postMessage({ key, value: control.value, uid: this.root.uid });
          return false;
        }
        const changed = !isEqual(asString, cacheValue);
        if (!changed) return false;
        this.cache.set(key, JSON.stringify(asString));
        return true;
      }),
      map((message) => message.value)
    );
  };
}

export * from './syncronization-extension-types';
