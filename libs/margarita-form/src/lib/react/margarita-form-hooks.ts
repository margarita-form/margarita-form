import type { MargaritaFormOptions } from '../margarita-form-types';
import { useEffect, useId, useMemo, useState } from 'react';
import { MargaritaForm } from '../margarita-form';

declare global {
  interface Window {
    [key: string]: MargaritaForm;
  }
}

export const useMargaritaForm = (options: MargaritaFormOptions) => {
  const formId = useId();

  const form = useMemo(() => {
    const hasWindow = typeof window !== 'undefined';
    if (hasWindow && formId in window) return window[formId];
    const newForm = new MargaritaForm(options);
    if (hasWindow) window[formId] = newForm;
    return newForm;
  }, [options]);

  const [value, setValue] = useState<unknown>(null);

  useEffect(() => {
    const subscription = form.valueChanges.subscribe(setValue);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { form, value };
};
