import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { createFormStore } from '../misc/margarita-form-store';
import { MFF, createMargaritaForm } from '@margarita-form/core';

export const useMargaritaForm = <FIELD extends MFF>(field: FIELD, useCache = true) => {
  const fieldRef = useRef(field);
  const form = useMemo(() => {
    return createMargaritaForm<FIELD>(field, useCache);
  }, [field.name]);

  useEffect(() => {
    const currentForm = form;
    currentForm.resubscribe();
    return () => currentForm.cleanup();
  }, [field.name]);

  useEffect(() => {
    if (fieldRef.current !== field) {
      fieldRef.current = field;
      form.updateField(field);
    }
  }, [field]);

  const store = createFormStore(form);

  useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(),
    () => store.getSnapshot()
  );

  return form;
};

export const useForm = useMargaritaForm;
