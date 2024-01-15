import { nanoid } from 'nanoid';
import { MargaritaFormControl, createMargaritaForm } from '..';

MargaritaFormControl.addValidator('foo', ({ value }) => (value !== 'foo' ? { valid: false, error: 'foo-message' } : { valid: true }));

describe('Resolver and validator inheritance', () => {
  it('should be able to inherit resolvers', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      resolvers: { baz: () => 'baz', qux: () => 'qux' },
      params: { foo: '$$baz' },
      fields: [
        {
          name: 'field1',
          params: { foo: '$$qux' },
        },
        {
          name: 'field2',
          params: { foo: '$$qux' },
          resolvers: { baz: () => 'baz2' },
          fields: [
            {
              name: 'field3',
              params: { foo: '$$baz' },
            },
            {
              name: 'field4',
              params: { foo: '$$qux' },
            },
          ],
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(form.params).toEqual({ foo: 'baz' });

    const field1Control = form.getControl('field1');
    if (!field1Control) throw new Error('Control not found');
    expect(field1Control.params).toEqual({ foo: 'qux' });

    const field2Control = form.getControl('field2');
    if (!field2Control) throw new Error('Control not found');
    expect(field2Control.params).toEqual({ foo: 'qux' });

    const field3Control = field2Control.getControl('field3');
    if (!field3Control) throw new Error('Control not found');
    expect(field3Control.params).toEqual({ foo: 'baz2' });

    const field4Control = field2Control.getControl('field4');
    if (!field4Control) throw new Error('Control not found');
    expect(field4Control.params).toEqual({ foo: 'qux' });
  });

  it('should be able to inherit validators', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      validators: { baz: ({ value }) => (value !== 'baz' ? { valid: false, error: 'baz-message' } : { valid: true }) },
      validation: { foo: true, baz: true },
      fields: [
        {
          name: 'field1',
          validation: { foo: true },
          initialValue: 'foo',
        },
        {
          name: 'field2',
          validation: { foo: true, baz: true },
          fields: [
            {
              name: 'field3',
              validation: { foo: true },
              initialValue: 'foo',
            },
            {
              name: 'field4',
              validation: { baz: true },
              initialValue: 'baz',
            },
            {
              name: 'field5',
              validation: { foo: true, baz: true },
              initialValue: 'unknown',
            },
            {
              name: 'field6',
              validation: { foo: () => ({ valid: true }), baz: () => ({ valid: true }) },
              initialValue: 'unknown',
            },
          ],
        },
      ],
    });

    await form.validate();
    expect(form.state.valid).toBe(false);
    expect(form.state.errors).toEqual({ foo: 'foo-message', baz: 'baz-message' });

    const field1Control = form.getControl('field1');
    if (!field1Control) throw new Error('Control not found');
    expect(field1Control.state.valid).toBe(true);

    const field2Control = form.getControl('field2');
    if (!field2Control) throw new Error('Control not found');
    expect(field2Control.state.valid).toBe(false);
    expect(field2Control.state.errors).toEqual({ foo: 'foo-message', baz: 'baz-message' });

    const field3Control = field2Control.getControl('field3');
    if (!field3Control) throw new Error('Control not found');
    expect(field3Control.state.valid).toBe(true);

    const field4Control = field2Control.getControl('field4');
    if (!field4Control) throw new Error('Control not found');
    expect(field4Control.state.valid).toBe(true);

    const field5Control = field2Control.getControl('field5');
    if (!field5Control) throw new Error('Control not found');
    expect(field5Control.state.valid).toBe(false);
    expect(field5Control.state.errors).toEqual({ foo: 'foo-message', baz: 'baz-message' });

    const field6Control = field2Control.getControl('field6');
    if (!field6Control) throw new Error('Control not found');
    expect(field6Control.state.valid).toBe(true);
  });
});
