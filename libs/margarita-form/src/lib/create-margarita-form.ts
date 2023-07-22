import type { MFF } from './margarita-form-types';
import { MargaritaForm } from './margarita-form';

/**
 * Forms cache is to store forms in memory to avoid creating new forms. Cache is cleared when the app is reloaded.
 */
export const formsCache = new Map<string, MargaritaForm<any, any>>();

export const getFormFromCache = (name: string) => {
  return formsCache.get(name);
};

export const addFormToCache = (form: MargaritaForm<any, any>) => {
  formsCache.set(form.name, form);
};

export const removeFormFromCache = (name: string) => {
  formsCache.delete(name);
};

/**
 * Creates a new instance of MargaritaForm.
 * @param field - Field to create a form for.
 * @returns New instance of MargaritaForm.
 * @example
 * ```
 * const form = createMargaritaForm({
 *   name: 'myForm',
 *   fields: [
 *     {
 *       name: 'myField'
 *     }
 *   ]
 * });
 * ```
 */
export const createMargaritaForm = <VALUE = unknown, FIELD extends MFF = MFF>(field: FIELD): MargaritaForm<VALUE, FIELD> => {
  if (field.config?.useCacheForForms) {
    const name = field.name;
    const cachedForm = formsCache.get(name);
    if (cachedForm) {
      cachedForm.updateField(field, false);
      return cachedForm as MargaritaForm<VALUE, FIELD>;
    }
  }
  const form = new MargaritaForm<VALUE, FIELD>(field);
  if (field.config?.useCacheForForms) addFormToCache(form);
  return form;
};
