import { nanoid } from 'nanoid';
import { MFF, MargaritaForm, createMargaritaForm } from '../../index';
import { MargaritaFormI18NExtension } from '../extensions/margarita-form-i18n-extension';

MargaritaForm.addExtension(MargaritaFormI18NExtension);

declare module '../extensions/margarita-form-i18n-extension' {
  export interface Locales {
    en: Locale;
    fi: Locale;
  }
}

describe('i18n extension testing', () => {
  it('should have i18n features', async () => {
    const form = createMargaritaForm<
      MFF<{
        i18n: {
          title: string;
          description: string;
        };
      }>
    >({
      name: nanoid(),
      initialValue: 'test',
      currentLocale: 'fi',
      i18n: {
        title: {
          en: 'Hello',
          fi: 'Hei',
        },
        description: {
          en: 'Description',
          fi: 'Kuvaus',
        },
      },
    });

    expect(form.i18n).toEqual({
      title: 'Hei',
      description: 'Kuvaus',
    });

    form.cleanup();
  });
});
