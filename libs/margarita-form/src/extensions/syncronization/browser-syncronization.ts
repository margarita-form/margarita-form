import { Observable, fromEvent, map } from 'rxjs';
import { MFC } from '../../typings/margarita-form-types';
import { SyncronizationExtensionBase } from './syncronization-extension-base';
import { BroadcasterMessage } from './syncronization-extension-types';

export class BrowserSyncronizationExtension extends SyncronizationExtensionBase {
  constructor(public override root: MFC) {
    super(root);
  }

  get broadcastChannel(): BroadcastChannel | undefined {
    if (typeof window === 'undefined') return undefined;
    return new BroadcastChannel(this.root.name);
  }

  public override postMessage(message: BroadcasterMessage): void {
    if (!this.broadcastChannel) throw 'BroadcastChannel is not supported in this browser!';
    this.broadcastChannel.postMessage(message);
  }

  public override listenToMessages<DATA>(): Observable<BroadcasterMessage<DATA>> {
    if (!this.broadcastChannel) throw 'BroadcastChannel is not supported in this browser!';
    const observable = fromEvent<MessageEvent>(this.broadcastChannel, 'message').pipe(map((event) => event.data));
    return observable;
  }
}

export * from './syncronization-extension-base';
