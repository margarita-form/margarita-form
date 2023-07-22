import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createFormStore } from '../misc/margarita-form-store';
import { MFF, createMargaritaForm } from '@margarita-form/core';

export const useMargaritaForm = <VALUE = unknown, FIELD extends MFF<VALUE> = MFF<VALUE>>(field: FIELD) => {
  const form = useMemo(() => {
    return createMargaritaForm<VALUE, FIELD>(field);
  }, [field.name]);

  useEffect(() => {
    const currentForm = form;
    currentForm.resubscribe();
    return () => currentForm.cleanup();
  }, [field.name]);

  const store = createFormStore(form);

  useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(),
    () => store.getSnapshot()
  );

  return form;
};

export const useForm = useMargaritaForm;
