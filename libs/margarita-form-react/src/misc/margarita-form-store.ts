import type { MF } from '@margarita-form/core';

export const createFormStore = (form: MF) => {
  const subscribe = (listener: () => void) => {
    const subscription = form.afterChanges.subscribe(() => {
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
