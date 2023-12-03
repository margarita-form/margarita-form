/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable, filter, map } from 'rxjs';
import { ExtensionName, Extensions, MFC } from '../../margarita-form-types';
import { BroadcasterMessage, SyncronizationExtensionConfig } from './syncronization-extension-types';
import { MargaritaFormControl } from '../../margarita-form-control';
import { isEqual } from '../../helpers/check-value';
import { ExtensionBase } from '../base/extension-base';

export const syncronizationExtensionDefaultConfig: SyncronizationExtensionConfig = {
  syncronizationKey: 'key',
};

export class SyncronizationExtensionBase extends ExtensionBase {
  public static override extensionName: ExtensionName = 'syncronization';
  public override readonly requireRoot = true;
  public override config: SyncronizationExtensionConfig = syncronizationExtensionDefaultConfig;
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

  private getSyncronizationKey(control = this.root): string {
    const { syncronizationKey } = this.getConfig(control);
    if (typeof syncronizationKey === 'function') return syncronizationKey(this.root);
    const key = control[syncronizationKey || 'key'];
    if (!key) throw new Error(`Could not get syncronization key from control!`);
    return key;
  }

  public override handleValueUpdate = <DATA = any>(control = this.root, value: DATA): void => {
    const key = this.getSyncronizationKey(control);
    const cachedValue = this.cache.get(key);
    const changed = !isEqual(value, cachedValue);
    if (changed) {
      const asString = JSON.stringify(value);
      this.cache.set(key, asString);
      this.postMessage({ key, value: value, uid: this.root.uid });
    }
  };

  public override getValueObservable = <DATA = any>(control: MFC): Observable<DATA | undefined> => {
    const key = this.getSyncronizationKey(control);
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

  public static override withConfig<C extends SyncronizationExtensionConfig>(config: C) {
    return super.withConfig(config);
  }
}

export * from './syncronization-extension-types';

SyncronizationExtensionBase.withConfig({});
