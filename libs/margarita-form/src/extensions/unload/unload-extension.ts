import { Subscription, distinctUntilKeyChanged, filter, fromEvent, map, skip, switchMap, takeUntil } from 'rxjs';
import { MFC } from '../../typings/margarita-form-types';
import { ExtensionBase } from '../base/extension-base';

export class UnloadExtension extends ExtensionBase {
  private subscriptions: Subscription[] = [];

  constructor(public override root: MFC) {
    super(root);
  }

  private _createUnloadListener() {
    const stateChanges = this.root.onSubmit.pipe(
      map((control) => control.state),
      distinctUntilKeyChanged('submits'),
      filter((state) => state.submitResult === 'success')
    );

    const unloadEvent = fromEvent(window, 'beforeunload').pipe(takeUntil(stateChanges));
    return this.root.valueChanges
      .pipe(
        skip(1),
        switchMap(() => unloadEvent)
      )
      .subscribe((event) => event.preventDefault());
  }

  public override afterReady = (control: MFC) => {
    if (!control.isRoot) return;
    const subscription = this._createUnloadListener();
    this.subscriptions.push(subscription);
  };

  public override onCleanup = (control: MFC) => {
    if (!control.isRoot) return;
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  };
}
