import { MargaritaFormControl } from '../../margarita-form-control';
import { MFF } from '../../margarita-form-types';

export const extendMargaritaForm = () => {
  MargaritaFormControl.extend({
    get i18n(): MFF['__i18n'] {
      const { field, extensions } = this as MargaritaFormControl;
      const { i18n } = field;
      if (!i18n) return undefined;
      const { localization } = extensions;
      return localization.getLocalizedValue(i18n, this.currentLocale);
    },
  });
};
