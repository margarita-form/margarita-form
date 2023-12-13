import type { MFF } from './margarita-form-types';
import { MargaritaForm } from './margarita-form';

/**
 * Forms cache is to store forms in memory to avoid creating new forms. Cache is cleared when the app is reloaded.
 */
export const formsCache = new Map<string, MargaritaForm<any>>();

export const getFormFromCache = (name: string) => {
  return formsCache.get(name);
};

export const addFormToCache = (form: MargaritaForm<any>) => {
  formsCache.set(form.name, form);
};

export const removeFormFromCache = (name: string) => {
  if (formsCache.has(name)) formsCache.delete(name);
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
export const createMargaritaForm = <FIELD extends MFF<any>>(field: FIELD, useCache = true): MargaritaForm<FIELD> => {
  if (useCache) {
    const name = field.name;
    const cachedForm = formsCache.get(name);
    if (cachedForm) {
      cachedForm.updateField(field, false);
      return cachedForm as MargaritaForm<FIELD>;
    }
  }
  const form = new MargaritaForm<FIELD>(field);
  if (useCache) addFormToCache(form);
  return form;
};
