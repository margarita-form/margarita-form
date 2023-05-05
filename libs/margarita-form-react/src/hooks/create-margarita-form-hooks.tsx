/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useId, useMemo, useSyncExternalStore } from 'react';
import { combineLatest, debounceTime } from 'rxjs';
import { createMargaritaForm, MargaritaForm, MargaritaFormOptions, MargaritaFormRootField, MFF } from '@margarita-form/core';

const forms: Record<string, unknown> = {};

const getForm = <VALUE = unknown, FIELD extends MFF<FIELD> = MFF>(formId: string, field: FIELD, options: MargaritaFormHookOptions = {}) => {
  if (formId in forms) {
    return forms[formId] as MargaritaForm<VALUE, FIELD>;
  }
  const isForm = field instanceof MargaritaForm;
  if (isForm) {
    forms[formId] = field;
    return field as unknown as MargaritaForm<VALUE, FIELD>;
  }
  const newForm = createMargaritaForm<VALUE, FIELD>(field, options);
  forms[formId] = newForm;
  return newForm as MargaritaForm<VALUE, FIELD>;
};

interface FormStore<VALUE = unknown, FIELD extends MFF<FIELD> = MFF> {
  form: MargaritaForm<VALUE, FIELD>;
  getSnapshot: () => unknown;
  subscribe: (listener: () => void) => () => void;
}

const stores: Record<string, FormStore<unknown, any>> = {};

const createFormStore = <VALUE = unknown, FIELD extends MFF<FIELD> = MFF>(
  id: string,
  field: FIELD,
  options: MargaritaFormHookOptions = {}
) => {
  const form = getForm<VALUE, FIELD>(id, field, options);

  const subscribe = (listener: () => void) => {
    const subscription = combineLatest([form.valueChanges, form.stateChanges])
      .pipe(debounceTime(5))
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

interface MargaritaFormHookOptions extends MargaritaFormOptions {
  resetFormOnFieldChanges?: boolean;
}

export const useMargaritaForm = <VALUE = unknown, FIELD extends MFF<FIELD> = MFF>(
  field: Partial<FIELD> & MargaritaFormRootField<VALUE>,
  options: MargaritaFormHookOptions = {},
  deps: any[] = []
) => {
  const formId = useId();
  if (!stores[formId]) stores[formId] = createFormStore(formId, field as any, options);
  const store = stores[formId] as FormStore<VALUE, FIELD>;
  useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(),
    () => store.getSnapshot()
  );
  const { form } = store;

  const computedFieldValue = useMemo(() => {
    try {
      return JSON.stringify(field);
    } catch (error) {
      return null;
    }
  }, [field]);

  const { resetFormOnFieldChanges = false } = options;

  useEffect(() => {
    form.updateField(field, resetFormOnFieldChanges);
  }, [computedFieldValue, resetFormOnFieldChanges, ...deps]);

  useEffect(() => {
    form.resubscribe();
    return () => {
      form.cleanup();
    };
  }, []);

  return form;
};
