import { nanoid } from 'nanoid';
import { MFF, MargaritaForm, MargaritaFormField, createMargaritaForm } from '../../index';
import { MargaritaFormI18NExtension } from '../extensions/i18n/i18n-extension';
import { Locale } from '../extensions/i18n/i18n-types';

MargaritaForm.addExtension(MargaritaFormI18NExtension);

declare module '../extensions/i18n/i18n-extension' {
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

  const fieldNameInitialValue = 'Hello world';
  const anotherInitialValue = 'Live long and prosper';

  const commonField: MargaritaFormField<{ value: string; fields: MFF }> = {
    name: 'fieldName',
    initialValue: fieldNameInitialValue,
  };
  const uncommonField: MargaritaFormField<{ value: any; fields: MFF }> = {
    name: 'anotherOne',
    initialValue: anotherInitialValue,
  };

  it('should create fields that are localized', () => {
    const form = createMargaritaForm<
      MFF<{
        i18n: {
          title: string;
          description: string;
        };
      }>
    >({
      name: nanoid(),
      currentLocale: 'fi',
      locales: {
        en: { title: 'English' },
        fi: { title: 'Suomi' },
      },
      initialValue: {
        [uncommonField.name]: {
          en: 'Hello world',
          fi: 'Hei maailma',
        },
      },
      fields: [
        {
          ...commonField,
          i18n: {
            content: {
              en: 'Hello world',
              fi: 'Hei maailma',
            },
          },
        },
        {
          ...uncommonField,
          localize: true,
          i18n: {
            content: {
              en: 'Hello world',
              fi: 'Hei maailma',
            },
          },
        },
      ],
    });

    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';
    expect(commonControl.i18n.content).toBe('Hei maailma');

    const uncommonControl = form.getControl([uncommonField.name]);
    if (!uncommonControl) throw 'No control found!';
    expect(uncommonControl.i18n.content).toBe('Hei maailma');
    const enControl = uncommonControl.getControl('en');
    if (!enControl) throw 'No control found!';
    expect(enControl.value).toBe('Hello world');
    expect(enControl.i18n.content).toBe('Hello world');
    const fiControl = uncommonControl.getControl('fi');
    if (!fiControl) throw 'No control found!';
    expect(fiControl.value).toBe('Hei maailma');
    expect(fiControl.i18n.content).toBe('Hei maailma');

    form.cleanup();
  });
});
