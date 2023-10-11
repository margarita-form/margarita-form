/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { createFormStore } from '../misc/margarita-form-store';
import { MFF, createMargaritaForm, isEqual } from '@margarita-form/core';

export const useMargaritaForm = <FIELD extends MFF>(field: FIELD, useCache = true) => {
  const fieldRef = useRef<null | FIELD>(null);
  const form = useMemo(() => {
    return createMargaritaForm<FIELD>(field, useCache);
  }, [field.name]);

  useEffect(() => {
    if (!fieldRef.current) {
      fieldRef.current = field;
      return () => {};
    }
    const currentForm = form;
    currentForm.resubscribe();
    return () => currentForm.cleanup();
  }, [field.name]);

  useEffect(() => {
    const { current } = fieldRef;
    const changed = current && !isEqual(current, field, false);
    if (changed) {
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
