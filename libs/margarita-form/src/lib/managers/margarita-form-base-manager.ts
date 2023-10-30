/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, Subscription, debounceTime, filter, map, shareReplay, startWith } from 'rxjs';
import { ControlChange, MFC, MFF } from '../margarita-form-types';

export interface Subscribable<VALUE = unknown> {
  observable: Observable<VALUE>;
  callback: (value: VALUE) => any;
}

type ManagerChanges<VALUE> = Observable<ControlChange<MFF, VALUE>>;

export class BaseManager<VALUE = unknown> {
  public value: VALUE = undefined as any;
  public subscriptions: Subscription[] = [];

  constructor(public name: string, public control: MFC, public initialValue?: VALUE) {
    this.value = initialValue as VALUE;
  }

  public get changes(): Observable<VALUE> {
    const observable = this.control.changes.pipe(filter((change) => change.name === this.name)) as ManagerChanges<VALUE>;
    return observable.pipe(
      map(({ change }) => change),
      startWith(this.value),
      debounceTime(1)
    );
  }

  public get otherChanges(): Observable<unknown> {
    const observable = this.control.changes.pipe(filter((change) => change.name !== this.name)) as ManagerChanges<unknown>;
    return observable.pipe(
      map(({ change }) => change),
      shareReplay(1)
    );
  }

  public emitChange = <VALUE = unknown>(change: VALUE) => {
    this.control.emitChange(this.name, change);
  };

  public prepare() {
    // Do nothing
  }

  public onInitialize() {
    // Do nothing
  }

  public afterInitialize() {
    // Do nothing
  }

  public onCleanup() {
    // Do nothing
  }

  public cleanup() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.onCleanup();
    this.subscriptions = [];
  }

  public createSubscription = <VALUE = unknown>(
    observable: Subscribable<VALUE>['observable'],
    callback: Subscribable<VALUE>['callback']
  ) => {
    const subscription = observable.subscribe(callback);
    this.subscriptions.push(subscription);
  };
}
