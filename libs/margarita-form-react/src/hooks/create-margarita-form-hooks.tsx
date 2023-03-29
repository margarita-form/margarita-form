/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId, useSyncExternalStore } from 'react';
import { combineLatest, debounceTime, skip } from 'rxjs';
import {
  createMargaritaForm,
  MargaritaForm,
  MargaritaFormField,
  MargaritaFormOptions,
} from '@margarita-form/core';

const forms: Record<string, unknown> = {};

const getForm = <T, F extends MargaritaFormField = MargaritaFormField>(
  formId: string,
  options: MargaritaFormOptions<T, F>
) => {
  if (formId in forms) return forms[formId] as MargaritaForm<T, F>;
  const newForm = createMargaritaForm<T, F>(options);
  forms[formId] = newForm;
  return newForm as MargaritaForm<T, F>;
};

interface FormStore<T, F extends MargaritaFormField = MargaritaFormField> {
  form: MargaritaForm<T, F>;
  getSnapshot: () => unknown;
  subscribe: (listener: () => void) => () => void;
}

const stores: Record<string, FormStore<unknown, any>> = {};

const createFormStore = <T, F extends MargaritaFormField = MargaritaFormField>(
  id: string,
  options: MargaritaFormOptions<T, F>
): FormStore<T, F> => {
  const form = getForm<T, F>(id, options);

  const subscribe = (listener: () => void) => {
    const changes = combineLatest([form.valueChanges, form.stateChanges]);
    const subscription = changes
      .pipe(debounceTime(50), skip(1))
      .subscribe(() => {
        form.updateSyncId();
        listener();
      });
    return () => subscription.unsubscribe();
  };

  const getSnapshot = () => {
    return form.syncId;
  };

  return {
    form,
    getSnapshot,
    subscribe,
  };
};

export const useMargaritaForm = <
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
>(
  options: MargaritaFormOptions<T, F>
) => {
  const formId = useId();
  if (!stores[formId]) stores[formId] = createFormStore(formId, options);
  const store = stores[formId] as FormStore<T, F>;
  useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(),
    () => store.getSnapshot()
  );
  const { form } = store;
  return form;
};
