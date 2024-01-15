import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../../';
import { MFGF } from '../../typings/margarita-form-types';
import { FieldModifiersExtension } from './field-modifiers-extension';

describe('field modifiers extension testing', () => {
  it('Check that field modifiers work corretly', async () => {
    const formName = nanoid();
    const form = createMargaritaForm<MFGF>({
      name: formName,
      extensions: [FieldModifiersExtension],
      fieldModifiers: [
        () => ({ hello: true }),
        {
          condition: ({ field }) => field?.name === 'invalidName',
          modifier: () => ({ name: 'betterName' }),
        },
      ],
      fields: [
        {
          name: 'field',
          fieldModifiers: [() => ({ params: { lorem: 'ipsum' } })],
        },
        {
          name: 'invalidName',
          fieldModifiers: [() => ({ params: { ipsum: 'lorem' } })],
        },
      ],
    });

    expect(form.field['hello']).toBe(true);
    const fieldControl = form.getControl('field');
    if (!fieldControl) throw new Error('field not found');

    expect(fieldControl.name).toBe('field');
    expect(fieldControl.params).toEqual({ lorem: 'ipsum' });
    expect(fieldControl.field['hello']).toBe(true);

    const invalidControl = form.getControl('invalidName');
    expect(invalidControl).toBeUndefined();

    const betterControl = form.getControl('betterName');
    if (!betterControl) throw new Error('betterControl not found');
    expect(betterControl.name).toBe('betterName');
    expect(betterControl.params).toEqual({ ipsum: 'lorem' });
    expect(fieldControl.field['hello']).toBe(true);
  });
});
