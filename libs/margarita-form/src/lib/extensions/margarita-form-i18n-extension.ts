import { CommonRecord, MFC } from '../margarita-form-types';

export class MargaritaFormI18NExtension<CONTROL extends MFC> {
  public static localeNames?: Record<string, string>;
  constructor(public control: CONTROL) {}

  get locales() {
    return this.control.locales;
  }

  get currentLocale() {
    const { currentLocale } = this.control;
    if (!currentLocale) throw 'No current locale provided!';
    return currentLocale;
  }

  public getLocalizedValue<RETURN = any>(obj: unknown, locale: string = this.currentLocale): RETURN {
    if (!obj) return obj as RETURN;
    if (!locale) throw 'No locale provided!';
    if (typeof obj !== 'object') return obj as RETURN;
    if (locale in obj) return (obj as CommonRecord)[locale] as RETURN;

    const entries = Object.entries(obj).map(([key, value]) => {
      type CHILD_RETURN = RETURN[keyof RETURN];
      const _value = this.getLocalizedValue<CHILD_RETURN>(value, locale);
      return [key, _value];
    });

    return Object.fromEntries(entries);
  }
}
