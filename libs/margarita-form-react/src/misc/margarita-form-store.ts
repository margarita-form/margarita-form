import type { MF } from '@margarita-form/core/light';
import { shareReplay } from 'rxjs';

export const useFormStore = (form: MF) => {
  const subscribe = (listener: () => void) => {
    const subscription = form.afterChanges.pipe(shareReplay(1)).subscribe(() => {
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
