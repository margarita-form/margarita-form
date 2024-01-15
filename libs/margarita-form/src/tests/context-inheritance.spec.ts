import { nanoid } from 'nanoid';
import { MargaritaFormControl, createMargaritaForm } from '..';

MargaritaFormControl.addContextValue('foo', 'bar');

MargaritaFormControl.extendContext({
  lorem: 'ipsum',
  dolor: 'sit',
});

describe('Context inheritance', () => {
  it('should be able to inherit context', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      context: { asd: 'asd' },
      fields: [
        {
          name: 'field1',
        },
        {
          name: 'field2',
          context: { foo: 'baz' },
          fields: [
            {
              name: 'field3',
              context: { dolor: 'amet', asd: 'qwe' },
            },
          ],
        },
      ],
    });

    const formContext = form.context as any;
    expect(formContext.foo).toBe('bar');
    expect(formContext.lorem).toBe('ipsum');
    expect(formContext.dolor).toBe('sit');
    expect(formContext.asd).toBe('asd');

    const field1Control = form.getControl('field1');
    if (!field1Control) throw new Error('Control not found');

    const field1Context = field1Control.context as any;
    expect(field1Context.foo).toBe('bar');
    expect(field1Context.lorem).toBe('ipsum');
    expect(field1Context.dolor).toBe('sit');
    expect(field1Context.asd).toBe('asd');

    const field2Control = form.getControl('field2');
    const field2Context = field2Control?.context as any;
    expect(field2Context.foo).toBe('baz');
    expect(field2Context.lorem).toBe('ipsum');
    expect(field2Context.asd).toBe('asd');
    expect(field2Context.dolor).toBe('sit');
    if (!field2Control) throw new Error('Control not found');

    const field3Control = field2Control.getControl('field3');
    if (!field3Control) throw new Error('Control not found');

    const field3Context = field3Control.context as any;
    expect(field3Context.foo).toBe('baz');
    expect(field3Context.lorem).toBe('ipsum');
    expect(field3Context.asd).toBe('qwe');
    expect(field3Context.dolor).toBe('amet');
  });
});
