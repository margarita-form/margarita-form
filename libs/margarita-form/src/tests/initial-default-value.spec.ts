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

  it('should be able to verify that value is initial value even after changing it', async () => {
    const initialValue = nanoid();
    const notInitialValue = nanoid();

    const form = createMargaritaForm<RootField>({
      name: nanoid(),
      initialValue,
    });

    expect(form.value).toEqual(initialValue);
    expect(form.isInitialValue).toBe(true);
    form.setValue(notInitialValue);
    expect(form.value).toEqual(notInitialValue);
    expect(form.isInitialValue).toBe(false);
    form.setValue(initialValue);
    expect(form.value).toEqual(initialValue);
    expect(form.isInitialValue).toBe(true);
  });

  it('should be able to verify that value is default value even after changing it', async () => {
    const defaultValue = nanoid();
    const notDefaultValue = nanoid();

    const form = createMargaritaForm<RootField>({
      name: nanoid(),
      defaultValue,
    });

    expect(form.value).toEqual(defaultValue);
    expect(form.isDefaultValue).toBe(true);
    form.setValue(notDefaultValue);
    expect(form.value).toEqual(notDefaultValue);
    expect(form.isDefaultValue).toBe(false);
    form.setValue(defaultValue);
    expect(form.value).toEqual(defaultValue);
    expect(form.isDefaultValue).toBe(true);
  });
});
