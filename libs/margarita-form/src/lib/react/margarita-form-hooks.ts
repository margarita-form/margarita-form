import type {
  MargaritaFormOptions,
  MargaritaFormStatus,
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
  const [status, setStatus] = useState<MargaritaFormStatus | null>(null);

  useEffect(() => {
    const valueChangesSubscription = form.valueChanges.subscribe(setValue);
    const statusChangesSubscription = form.statusChanges.subscribe(setStatus);
    return () => {
      valueChangesSubscription.unsubscribe();
      statusChangesSubscription.unsubscribe();
    };
  }, []);

  return { form, value, status };
};
