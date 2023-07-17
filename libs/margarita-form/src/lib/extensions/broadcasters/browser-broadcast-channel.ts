import { Observable, fromEvent, map } from 'rxjs';
import { BroadcastLike, BroadcasterMessage, MFC } from '../../margarita-form-types';

export class BrowserBroadcastChannel implements BroadcastLike {
  constructor(public key: string, public control: MFC) {}

  get broadcastChannel(): BroadcastChannel | undefined {
    if (typeof window === 'undefined') return undefined;
    return new BroadcastChannel(this.key);
  }

  public postMessage(message: BroadcasterMessage): void {
    if (!this.broadcastChannel) return;
    this.broadcastChannel.postMessage(message);
  }

  public listenToMessages<DATA>(): void | Observable<BroadcasterMessage<DATA>> {
    if (!this.broadcastChannel) return;
    const observable = fromEvent<MessageEvent>(this.broadcastChannel, 'message').pipe(map((event) => event.data));
    return observable;
  }
}
