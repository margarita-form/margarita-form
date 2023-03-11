import type {
  MargaritaFormOptions,
  MargaritaFormState,
} from '../margarita-form-types';
import { useEffect, useId, useMemo, useState } from 'react';
import { createMargaritaForm, MargaritaForm } from '../margarita-form';

declare global {
  interface Window {
    [key: string]: MargaritaForm<unknown>;
  }
}

export const useMargaritaForm = <T = unknown>(
  options: MargaritaFormOptions
) => {
  const formId = useId();

  const form: MargaritaForm<T> = useMemo(() => {
    const hasWindow = typeof window !== 'undefined';
    if (hasWindow && formId in window)
      return window[formId] as MargaritaForm<T>;
    const newForm = createMargaritaForm(options);
    if (hasWindow) window[formId] = newForm;
    return newForm as MargaritaForm<T>;
  }, [options]);

  const [value, setValue] = useState<T>({} as T);
  const [state, setState] = useState<MargaritaFormState | null>(null);

  useEffect(() => {
    const valueChangesSubscription = form.valueChanges.subscribe(setValue);
    const stateChangesSubscription = form.stateChanges.subscribe(setState);
    return () => {
      valueChangesSubscription.unsubscribe();
      stateChangesSubscription.unsubscribe();
    };
  }, []);

  return { form, value, state };
};
