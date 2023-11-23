import type { MF } from '@margarita-form/core/light';
import { skip } from 'rxjs';

export const createFormStore = (form: MF) => {
  const subscribe = (listener: () => void) => {
    const subscription = form.afterChanges.pipe(skip(1)).subscribe(() => {
      listener();
    });
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
