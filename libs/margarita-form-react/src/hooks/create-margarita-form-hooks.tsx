/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId, useSyncExternalStore } from 'react';
import { combineLatest } from 'rxjs';
import {
  createMargaritaForm,
  MargaritaForm,
  MargaritaFormField,
  MargaritaFormGroupControl,
  MargaritaFormOptions,
} from '@margarita-form/core';

const forms: Record<string, unknown> = {};

const getForm = <T, F extends MargaritaFormField = MargaritaFormField>(
  formId: string,
  options: MargaritaFormOptions<T, F> | MargaritaForm<T, F>
) => {
  if (formId in forms) {
    return forms[formId] as MargaritaForm<T, F>;
  }
  const isForm = options instanceof MargaritaFormGroupControl;
  if (isForm) {
    forms[formId] = options;
    return options as MargaritaForm<T, F>;
  }
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
  options: MargaritaFormOptions<T, F> | MargaritaForm<T, F>
): FormStore<T, F> => {
  const form = getForm<T, F>(id, options);

  const subscribe = (listener: () => void) => {
    const changes = combineLatest([form.valueChanges, form.stateChanges]);
    const subscription = changes.subscribe(() => {
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
  options: MargaritaFormOptions<T, F> | MargaritaForm<T, F>
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
