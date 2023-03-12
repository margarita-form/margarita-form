import type { MargaritaFormOptions } from '../margarita-form-types';
import { useId, useSyncExternalStore } from 'react';
import { createMargaritaForm, MargaritaForm } from '../margarita-form';
import { combineLatest, debounceTime } from 'rxjs';

const forms: Record<string, MargaritaForm<unknown>> = {};

const getForm = <T>(formId: string, options: MargaritaFormOptions) => {
  if (formId in forms) return forms[formId] as MargaritaForm<T>;
  const newForm = createMargaritaForm(options);
  forms[formId] = newForm;
  return newForm as MargaritaForm<T>;
};

interface FormStore<T> {
  form: MargaritaForm<T>;
  getSnapshot: () => unknown;
  subscribe: (listener: () => void) => () => void;
}

const stores: Record<string, FormStore<unknown>> = {};

const createFormStore = <T>(
  id: string,
  options: MargaritaFormOptions
): FormStore<T> => {
  const form = getForm<T>(id, options);

  const subscribe = (listener: () => void) => {
    const changes = combineLatest([form.valueChanges, form.stateChanges]);
    const subscription = changes.pipe(debounceTime(50)).subscribe(() => {
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

export const useMargaritaForm = <T = unknown>(
  options: MargaritaFormOptions
) => {
  const formId = useId();
  if (!stores[formId]) stores[formId] = createFormStore(formId, options);
  const store = stores[formId] as FormStore<T>;
  useSyncExternalStore(store.subscribe, () => store.getSnapshot());
  const { form } = store;
  return {
    form,
    value: form.value,
    state: form.state,
  };
};
