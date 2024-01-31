import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';
import '../validators/add-all-validators';

describe('Custom error testing', () => {
  it('expect custom error to work', () => {
    const form = createMargaritaForm({
      name: nanoid(),
    });

    const message = 'Custom error';

    expect(form.error).toBeUndefined();
    form.setError(message);
    expect(form.error).toBeInstanceOf(Error);
    expect(form.error).toEqual(new Error(message));
    expect(form.errorMessage).toBe(message);
    expect(form.allErrors).toEqual([
      {
        control: form,
        error: new Error(message),
      },
    ]);

    form.setError(new Error(message + ' newer'));
    expect(form.error).toBeInstanceOf(Error);
    expect(form.error).toEqual(new Error(message + ' newer'));
    expect(form.errorMessage).toBe(message + ' newer');
    expect(form.allErrors).toEqual([
      {
        control: form,
        error: new Error(message + ' newer'),
      },
    ]);
  });

  it('inherit custom erros', () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        {
          name: 'field-1',
        },
        {
          name: 'field-2',
        },
        {
          name: 'field-3',
        },
      ],
    });

    const message = 'Custom error';

    expect(form.error).toBeUndefined();
    expect(form.allErrors).toEqual([]);

    const field1 = form.getControl('field-1');
    const field2 = form.getControl('field-2');
    const field3 = form.getControl('field-3');
    if (!field1 || !field2 || !field3) throw new Error('Fields not found');

    expect(field1.error).toBeUndefined();
    expect(field2.error).toBeUndefined();
    expect(field3.error).toBeUndefined();

    field1.setError(message + ' 1');
    field2.setError(message + ' 2');
    field3.setError(message + ' 3');

    expect(field1.error).toBeInstanceOf(Error);
    expect(field2.error).toBeInstanceOf(Error);
    expect(field3.error).toBeInstanceOf(Error);

    expect(field1.error).toEqual(new Error(message + ' 1'));
    expect(field2.error).toEqual(new Error(message + ' 2'));
    expect(field3.error).toEqual(new Error(message + ' 3'));

    expect(field1.errorMessage).toBe(message + ' 1');
    expect(field2.errorMessage).toBe(message + ' 2');
    expect(field3.errorMessage).toBe(message + ' 3');

    expect(form.allErrors).toEqual([
      {
        control: field1,
        error: new Error(message + ' 1'),
      },
      {
        control: field2,
        error: new Error(message + ' 2'),
      },
      {
        control: field3,
        error: new Error(message + ' 3'),
      },
    ]);
  });
});
