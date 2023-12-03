import { nanoid } from 'nanoid';
import { MFC, MFF, MargaritaFormField, createMargaritaForm } from '../../index';
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

  const commonField: MargaritaFormField<{ value: string; fields: MFF }> = {
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
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const commonControlValue = valueForm.getControl([commonField.name]);
    if (!commonControlValue) throw 'No control found!';
    expect(commonControlValue.value).toBe(storageValue);
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
});
