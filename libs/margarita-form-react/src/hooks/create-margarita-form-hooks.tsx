/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useId, useMemo, useSyncExternalStore } from 'react';
import { combineLatest, debounceTime } from 'rxjs';
import {
  createMargaritaForm,
  MargaritaForm,
  MargaritaFormRootField,
} from '@margarita-form/core';

const forms: Record<string, unknown> = {};

const getForm = <
  VALUE = unknown,
  FIELD extends MargaritaFormRootField = MargaritaFormRootField
>(
  formId: string,
  options: FIELD
) => {
  if (formId in forms) {
    return forms[formId] as MargaritaForm<VALUE, FIELD>;
  }
  const isForm = options instanceof MargaritaForm;
  if (isForm) {
    forms[formId] = options;
    return options;
  }
  const newForm = createMargaritaForm<VALUE, FIELD>(options);
  forms[formId] = newForm;
  return newForm as MargaritaForm<VALUE, FIELD>;
};

interface FormStore<
  VALUE = unknown,
  FIELD extends MargaritaFormRootField = MargaritaFormRootField
> {
  form: MargaritaForm<VALUE, FIELD>;
  getSnapshot: () => unknown;
  subscribe: (listener: () => void) => () => void;
}

const stores: Record<string, FormStore<unknown, any>> = {};

const createFormStore = <
  VALUE = unknown,
  FIELD extends MargaritaFormRootField = MargaritaFormRootField
>(
  id: string,
  options: FIELD
): FormStore<VALUE, FIELD> => {
  const form = getForm<VALUE, FIELD>(id, options);

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

interface MargaritaFormHookOptions {
  resetFormOnFieldChanges?: boolean;
}

export const useMargaritaForm = <
  VALUE = unknown,
  FIELD extends MargaritaFormRootField<VALUE> = MargaritaFormRootField<VALUE>
>(
  field: Partial<FIELD>,
  options: MargaritaFormHookOptions = {},
  deps: any[] = []
) => {
  const formId = useId();
  if (!stores[formId]) stores[formId] = createFormStore(formId, field as FIELD);
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
