/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, Subscription } from 'rxjs';

export interface Subscribable<VALUE = unknown> {
  observable: Observable<VALUE>;
  callback: (value: VALUE) => any;
}

export class BaseManager {
  public subscribables: Subscribable<any>[] = [];
  public subscriptions: Subscription[] = [];
  public onCleanup?: () => void;
  public onResubscribe?: () => void;

  public cleanup() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    if (this.onCleanup) this.onCleanup();
  }

  public createSubscription = <VALUE = unknown>(
    observable: Subscribable<VALUE>['observable'],
    callback: Subscribable<VALUE>['callback']
  ) => {
    const subscribable = { observable, callback };
    this.subscribables.push(subscribable);
    const subscription = observable.subscribe(callback);
    this.subscriptions.push(subscription);
  };

  public resubscribe() {
    this.subscribables.forEach(({ observable, callback }) => {
      const subscription = observable.subscribe(callback);
      this.subscriptions.push(subscription);
    });
    if (this.onResubscribe) this.onResubscribe();
  }
}
