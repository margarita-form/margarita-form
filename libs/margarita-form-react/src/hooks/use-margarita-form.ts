import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createFormStore } from '../misc/margarita-form-store';
import { MFF, createMargaritaForm } from '@margarita-form/core';

export const useMargaritaForm = <VALUE = unknown, FIELD extends MFF<VALUE> = MFF<VALUE>>(field: FIELD, deps: any[] = []) => {
  const form = createMargaritaForm<VALUE, FIELD>(field);
  const store = createFormStore(form);

  useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(),
    () => store.getSnapshot()
  );

  const computedFieldValue = useMemo(() => {
    try {
      return JSON.stringify(field);
    } catch (error) {
      return null;
    }
  }, [field]);

  useEffect(() => {
    form.updateField(field);
  }, [computedFieldValue, ...deps]);

  useEffect(() => {
    form.resubscribe();
    return () => {
      form.cleanup();
    };
  }, []);

  return form;
};
