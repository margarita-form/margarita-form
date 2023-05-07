import type { MF } from '@margarita-form/core';
import { combineLatest, debounceTime } from 'rxjs';

export const createFormStore = (form: MF) => {
  const subscribe = (listener: () => void) => {
    const subscription = combineLatest([form.valueChanges, form.stateChanges]).pipe(debounceTime(10)).subscribe(listener);
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
