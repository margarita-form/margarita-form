import { nanoid } from 'nanoid';
import { MFF, createMargaritaForm } from '../index';

type RootField = MFF<{ value: unknown }>;

const lorem = 'ipsum';

describe('Initial and default value', () => {
  it('should be able to create form where initial value is function', async () => {
    const form = createMargaritaForm<RootField>({
      name: nanoid(),
      initialValue: () => lorem,
    });

    expect(form.value).toEqual(lorem);
  });

  it('should be able to create form where default value is function', async () => {
    const form = createMargaritaForm<RootField>({
      name: nanoid(),
      defaultValue: () => lorem,
    });

    expect(form.value).toEqual(lorem);
  });

  it("should be able to create form where child control's value is function", async () => {
    const form = createMargaritaForm<RootField>({
      name: nanoid(),
      fields: [
        {
          name: 'child',
          initialValue: ({ parent }) => parent?.name,
        },
      ],
    });

    const childControl = form.getControl('child');
    if (!childControl) throw new Error('Child control not found');
    expect(childControl.value).toEqual(form.name);

    expect(form.value).toEqual({ child: form.name });
  });
});
