import type { MFF } from './margarita-form-types';
import { MargaritaForm } from './margarita-form';

const formsCache = new Map<string, MargaritaForm<any, any>>();

export const createMargaritaForm = <VALUE = unknown, FIELD extends MFF = MFF>(field: FIELD): MargaritaForm<VALUE, FIELD> => {
  if (field.config?.useCacheForForms !== false) {
    const name = field.name;
    if (!name) throw new Error('Form name is required!');
    const cachedForm = formsCache.get(name);
    if (cachedForm) {
      cachedForm.updateField(field, false);
      return cachedForm as MargaritaForm<VALUE, FIELD>;
    }
  }
  const form = new MargaritaForm<VALUE, FIELD>(field);
  formsCache.set(field.name, form);
  return form;
};
