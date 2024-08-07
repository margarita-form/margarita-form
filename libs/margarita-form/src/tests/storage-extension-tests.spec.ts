import { nanoid } from 'nanoid';
import { MFC, MFF, MargaritaFormField, createMargaritaForm } from '../index';
import { StorageExtensionBase } from '../extensions/storage/storage-extension-base';
import { Observable, delay } from 'rxjs';

const storageValue = 'storage-value';
const storage = {} as Record<string, any>;

class ValueStorage extends StorageExtensionBase {
  constructor(public override root: MFC) {
    super(root);
  }

  public override getItem(key: string) {
    if (!storage[key]) return null;
    return storage[key];
  }

  public override setItem(key: string, value: any): void {
    storage[key] = value;
  }
  public override removeItem(key: string): void {
    delete storage[key];
  }

  public override listenToChanges(key: string): Observable<any> {
    return new Observable((subscriber) => {
      const value = this.getItem(key);
      return subscriber.next(value);
    }).pipe(delay(10));
  }
}

describe('storage extension testing', () => {
  const fieldNameInitialValue = 'Hello world';

  const commonField: MargaritaFormField<{ value: string; fields: MFF; name: string }> = {
    name: 'fieldName',
    initialValue: fieldNameInitialValue,
  };

  it('Check that storage works corretly', async () => {
    const formName = nanoid();
    const form = createMargaritaForm<MFF>({
      name: formName,
      fields: [commonField],
      extensions: [ValueStorage],
    });
    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(commonControl.value).toBe(commonField.initialValue);
    form.cleanup();

    expect(storage[form.key]).toBeUndefined();

    form.storage.setItem(form.key, { [commonField.name]: storageValue });

    const valueForm = createMargaritaForm<MFF>({
      name: formName,
      fields: [commonField],
      extensions: [ValueStorage],
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const commonControlValue = valueForm.getControl([commonField.name]);
    if (!commonControlValue) throw 'No control found!';
    expect(commonControlValue.value).toBe(storageValue);
    valueForm.cleanup();
  });

  it('Check that storage key can be name', async () => {
    const formName = nanoid();
    const withName = ValueStorage.withConfig({ storageKey: 'name' });
    const form = createMargaritaForm<MFF>({
      name: formName,
      fields: [commonField],
      extensions: [withName],
    });
    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(storage[formName]).toBeUndefined();
    expect(commonControl.value).toBe(commonField.initialValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(commonControl.value).toBe(commonField.initialValue);
    await new Promise((resolve) => setTimeout(resolve, 100));
    commonControl.setValue(storageValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(storage[formName]).not.toBeUndefined();
    expect(storage[formName]).toBe(`{"${commonField.name}":"${storageValue}"}`);
    form.cleanup();

    const valueForm = createMargaritaForm<MFF>({
      name: formName,
      fields: [commonField],
      extensions: [withName],
      handleSubmit: () => {
        /* Works */
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const commonControlValue = valueForm.getControl([commonField.name]);
    if (!commonControlValue) throw 'No control found!';
    expect(commonControlValue.value).toBe(storageValue);

    await valueForm.submit();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(storage[formName]).toBeUndefined();

    valueForm.cleanup();
  });

  it('should override default config with control config', async () => {
    const formName = nanoid();
    const form = createMargaritaForm<MFF>({
      name: formName,
      fields: [commonField],
      extensions: [ValueStorage],
      config: {
        storage: {
          storageKey: 'name',
        },
      },
    });
    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(storage[formName]).toBeUndefined();
    expect(commonControl.value).toBe(commonField.initialValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(commonControl.value).toBe(commonField.initialValue);
    await new Promise((resolve) => setTimeout(resolve, 100));
    commonControl.setValue(storageValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(storage[formName]).not.toBeUndefined();
    expect(storage[formName]).toBe(`{"${commonField.name}":"${storageValue}"}`);
    form.cleanup();
  });

  it('should save end values if strategy is set as "end"', async () => {
    const newStorageValue = 'new-storage-value';
    const formName = nanoid();
    const withEnd = ValueStorage.withConfig({ storageStrategy: 'end', storageKey: 'name' });
    const form = createMargaritaForm<MFF>({
      name: formName,
      fields: [commonField],
      extensions: [withEnd],
    });
    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(storage[commonField.name]).toBeUndefined();
    expect(commonControl.value).toBe(commonField.initialValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(commonControl.value).toBe(commonField.initialValue);
    await new Promise((resolve) => setTimeout(resolve, 100));
    commonControl.setValue(newStorageValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(storage[commonField.name]).not.toBeUndefined();
    expect(storage[commonField.name]).toBe(newStorageValue);
    expect(storage[formName]).toBeUndefined();
    form.cleanup();
  });

  it('should not save value that is default value', async () => {
    const formName = nanoid();
    const defaultValue = nanoid();
    const notDefaultValue = nanoid();
    const saveDefaultValueFalse = ValueStorage.withConfig({ saveDefaultValue: false, storageKey: 'name' });

    const form = createMargaritaForm<MFF>({
      name: formName,
      defaultValue,
      extensions: [saveDefaultValueFalse],
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(form.value).toEqual(defaultValue);
    expect(form.isDefaultValue).toBe(true);
    expect(storage[formName]).toBeUndefined();

    form.setValue(notDefaultValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(form.value).toEqual(notDefaultValue);
    expect(form.isDefaultValue).toBe(false);
    expect(storage[formName]).toBe(notDefaultValue);

    form.setValue(defaultValue);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(form.value).toEqual(defaultValue);
    expect(form.isDefaultValue).toBe(true);
    expect(storage[formName]).toBeUndefined();
  });
});
