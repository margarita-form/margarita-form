/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, Subscription, debounceTime, filter, firstValueFrom, map, shareReplay, startWith } from 'rxjs';
import { ControlChange, MFC, MFF, Managers } from '../typings/margarita-form-types';

export interface Subscribable<VALUE = unknown> {
  observable: Observable<VALUE>;
  callback: (value: VALUE) => any;
}

type ManagerChanges<VALUE> = Observable<ControlChange<MFF, VALUE>>;

export class BaseManager<VALUE = unknown> {
  public static managerName: ManagerName;
  public _value: VALUE = undefined as any;
  public get value(): VALUE {
    return this._value;
  }
  public set value(value: VALUE) {
    this._value = value;
  }
  public subscriptions: Subscription[] = [];

  constructor(public control: MFC, public initialValue?: VALUE) {
    this.value = initialValue as VALUE;
  }

  get name(): keyof Managers {
    const constructor = this.constructor as typeof BaseManager;
    return constructor.managerName;
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
    this.control.updateSyncId();
    this.control.emitChange(this.name, change);
    return firstValueFrom(this.changes);
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

class _ManagerLike extends BaseManager {
  public static override managerName = '_' as any;
  constructor(control: MFC<any>) {
    super(control);
  }
}

export type ManagerLike = typeof _ManagerLike;
export type ManagerLikeInstance = InstanceType<ManagerLike>;
export type ManagerName = keyof Managers;
