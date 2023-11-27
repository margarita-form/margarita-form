import { MargaritaFormControl } from '../../margarita-form-control';
import { CommonRecord, ExtensionName, MFC, MFF } from '../../margarita-form-types';
import { MargaritaFormHandleLocalize } from './i18n-types';

const fallbackFn = () => ({});

export class MargaritaFormI18NExtension {
  public static extensionName: ExtensionName = 'localization';
  public static localeNames?: Record<string, string>;

  constructor(public control: MFC) {
    MargaritaFormControl.extend({
      get i18n(): MFF['__i18n'] {
        const { field, extensions } = this as MargaritaFormControl;
        const { i18n } = field;
        if (!i18n) return undefined;
        const { localization } = extensions;
        return localization.getLocalizedValue(i18n, this.currentLocale);
      },
    });
  }

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

  public static localizeField<FIELD extends MFC['field']>(control: MFC, field: FIELD): MFF {
    const { localizationOutput } = field.config || control.config;
    const locales = control.locales || [];
    const localeNames = Object.keys(locales);
    const getValue = (key: 'defaultValue' | 'initialValue') => (field[key] && typeof field[key] === 'object' ? field[key] : undefined);
    const defaultValue = getValue('defaultValue');
    const initialValue = getValue('initialValue');

    const { parent = fallbackFn, child = fallbackFn } =
      field.handleLocalize || control.getFieldValue<MargaritaFormHandleLocalize<FIELD>>('handleLocalize', {});

    if (localizationOutput === 'array') {
      const { config = {}, ...parentFieldHandlerResult } = parent({ field, parent: control, locales }) as Partial<MFF>;
      const localizedArrayField: MFF = {
        name: field.name,
        localize: false,
        wasLocalized: true,
        defaultValue,
        initialValue,
        grouping: 'array',
        startWith: localeNames,
        ...parentFieldHandlerResult,
        config: { ...config, addMetadata: true },
        fields: localeNames.map((localeName) => {
          const locale = locales[localeName];
          const hasSubFields = field.fields && field.fields.length > 0;
          const { config = {}, ...childFieldHandlerResult } = child({ field, parent: control, locale }) as Partial<MFF>;
          const _field = { ...field, localize: false, wasLocalized: true, config: { addMetadata: false } };
          const res: Partial<MFF> = hasSubFields ? { ..._field, ...childFieldHandlerResult } : childFieldHandlerResult;
          const fields = hasSubFields ? field.fields : [_field];
          return {
            ...res,
            fields,
            localize: false,
            name: localeName,
            isLocaleField: true,
            currentLocale: localeName,
            grouping: 'group',
            initialValue: initialValue ? undefined : field.initialValue,
            config: { ...config, addMetadata: true },
          };
        }),
      };
      return localizedArrayField;
    }

    const localizedObjectField: FIELD = {
      ...field,
      localize: false,
      wasLocalized: true,
      validation: null,
      initialValue,
      ...parent({ field, parent: control, locales }),
      fields: localeNames.map((localeName) => {
        const locale = locales[localeName];
        return {
          ...field,
          localize: false,
          name: localeName,
          isLocaleField: true,
          currentLocale: localeName,
          initialValue: initialValue ? undefined : field.initialValue,
          ...child({ field, parent: control, locale }),
        };
      }),
    };

    return localizedObjectField;
  }
}
