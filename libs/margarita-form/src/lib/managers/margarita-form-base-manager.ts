/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, Subscription } from 'rxjs';

export interface Subscribable<VALUE = unknown> {
  observable: Observable<VALUE>;
  callback: (value: VALUE) => any;
}

type ManagerStatus = 'subscribed' | 'initializing' | 'finished';

export class BaseManager {
  public status: ManagerStatus = 'initializing';
  public subscribables: Subscribable<any>[] = [];
  public subscriptions: Subscription[] = [];
  public onCleanup?: () => void;
  public onResubscribe?: () => void;

  public onInitialize() {
    this.status = 'subscribed';
  }

  public afterInitialize() {
    this.status = 'subscribed';
  }

  public cleanup() {
    if (this.status === 'finished') return; // Manager is already finished
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    if (this.onCleanup) this.onCleanup();
    this.status = 'finished';
  }

  public resubscribe() {
    if (this.status === 'subscribed') return; // Manager is already subscribed
    this.subscribables.forEach(({ observable, callback }) => {
      const subscription = observable.subscribe(callback);
      this.subscriptions.push(subscription);
    });
    if (this.onResubscribe) this.onResubscribe();
    this.status = 'subscribed';
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
}
