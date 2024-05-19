/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonRecord, MFC, MFF, MFGF } from '../../typings/margarita-form-types';
import { I18NExtension } from './i18n-extension';

export interface I18NExtensionConfig {
  localizationOutput?: 'object' | 'array';
}

export interface Locale {
  title: string;
}

export interface Locales {
  [key: string]: Locale;
}

export type LocaleNames = keyof Locales;

export type MargaritaFormHandleLocalizeParentFn<FIELD extends MFF = MFGF> = (params: {
  field: FIELD;
  parent: MFC<MFF>;
  locales: Locales;
}) => Partial<FIELD> | CommonRecord;

export type MargaritaFormHandleLocalizeChildFn<FIELD extends MFF = MFGF> = (params: {
  field: FIELD;
  parent: MFC<MFF>;
  locale: Locale;
}) => Partial<FIELD> | CommonRecord;

export interface MargaritaFormHandleLocalize<FIELD extends MFF = MFGF> {
  parent?: MargaritaFormHandleLocalizeParentFn<FIELD>;
  child?: MargaritaFormHandleLocalizeChildFn<FIELD>;
}

/**
 * Transform i18n object to a record of where each value is mapped into a record of locales.
 */
export type I18NField<I18NType extends object> = {
  [K in keyof I18NType]: {
    [L in LocaleNames]: I18NType[K];
  };
};

declare module '@margarita-form/core' {
  export interface Extensions {
    localization: I18NExtension;
  }

  export interface Configs {
    localization: I18NExtensionConfig;
  }

  export interface FieldParams {
    i18n?: any;
  }

  export interface FieldBase<PARAMS extends FieldParams> {
    locales?: Locales;
    localize?: boolean;
    currentLocale?: LocaleNames;
    i18n?: I18NField<PARAMS['i18n']>;
    wasLocalized?: boolean;
    isLocaleField?: boolean;
    handleLocalize?: MargaritaFormHandleLocalize;
    __i18n?: PARAMS['i18n'];
  }

  export interface ControlBase<FIELD extends MFF> {
    get i18n(): FIELD['__i18n'];
    get locales(): Locales;
    get currentLocale(): LocaleNames;
  }
}
