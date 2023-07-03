import type { MF } from '@margarita-form/core';
import { BehaviorSubject, combineLatest, debounceTime } from 'rxjs';

export const createFormStore = (form: MF) => {
  const subscribe = (listener: () => void) => {
    const managerChanges = Object.values(form.managers)
      .filter((manager) => 'changes' in manager)
      .map((manager) => 'changes' in manager && manager.changes) as BehaviorSubject<unknown>[];

    const subscription = combineLatest(managerChanges).pipe(debounceTime(10)).subscribe(listener);
    return () => {
      subscription.unsubscribe();
    };
  };

  const getSnapshot = () => {
    return form.syncId;
  };

  return {
    getSnapshot,
    subscribe,
  };
};
