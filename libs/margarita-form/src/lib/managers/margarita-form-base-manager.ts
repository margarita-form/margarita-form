import { Subscription } from 'rxjs';

export class BaseManager {
  public subscriptions: Subscription[] = [];
  public onCleanup?: () => void;

  public cleanup() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    if (this.onCleanup) this.onCleanup();
  }
}
