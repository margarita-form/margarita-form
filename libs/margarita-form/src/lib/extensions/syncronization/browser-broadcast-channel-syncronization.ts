import { Observable, fromEvent, map } from 'rxjs';
import { MFC } from '../../margarita-form-types';
import { SyncronizationExtensionBase } from './syncronization-extension-base';
import { BroadcasterMessage } from './syncronization-extension-types';

export class BrowserBroadcastChannel extends SyncronizationExtensionBase {
  constructor(public override root: MFC) {
    super(root);
  }

  get broadcastChannel(): BroadcastChannel | undefined {
    if (typeof window === 'undefined') return undefined;
    return new BroadcastChannel(this.root.name);
  }

  public override postMessage(message: BroadcasterMessage): void {
    if (!this.broadcastChannel) return;
    this.broadcastChannel.postMessage(message);
  }

  public override listenToMessages<DATA>(): void | Observable<BroadcasterMessage<DATA>> {
    if (!this.broadcastChannel) return;
    const observable = fromEvent<MessageEvent>(this.broadcastChannel, 'message').pipe(map((event) => event.data));
    return observable;
  }
}
