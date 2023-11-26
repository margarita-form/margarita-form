import type { MF } from '@margarita-form/core/light';
import { useRef } from 'react';
import { shareReplay, skip } from 'rxjs';

export const createFormStore = (form: MF) => {
  const changes = useRef(form.afterChanges.pipe(skip(1), shareReplay(1)));
  const subscribe = (listener: () => void) => {
    const subscription = changes.current.subscribe(() => {
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
