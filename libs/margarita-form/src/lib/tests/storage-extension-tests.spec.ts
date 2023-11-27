import { nanoid } from 'nanoid';
import { CommonRecord, MFC, MFF, MargaritaForm, MargaritaFormField, createMargaritaForm } from '../../index';
import { StorageExtensionBase } from '../extensions/storage/storage-extension-base';
import { Observable, delay } from 'rxjs';

const storageValue = 'storage-value';

class ValueStorage extends StorageExtensionBase {
  public value: null | CommonRecord = null;

  constructor(public override control: MFC) {
    super(control);
  }

  public override getItem(key: string) {
    if (!this.value || !this.value[key]) return null;
    return this.value[key];
  }

  public override setItem(key: string, value: any): void {
    const current = this.value || {};
    this.value = { ...current, [key]: value };
  }
  public override removeItem(key: string): void {
    this.value = { ...this.value, [key]: undefined };
  }

  public override listenToChanges(key: string): Observable<any> {
    return new Observable((subscriber) => {
      const value = this.getItem(key);
      return subscriber.next(value);
    }).pipe(delay(10));
  }
}

MargaritaForm.addExtension(ValueStorage);

declare module '../typings/expandable-types' {
  export interface Extensions {
    storage: InstanceType<typeof ValueStorage>;
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
    });
    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(commonControl.value).toBe(commonField.initialValue);
    form.cleanup();

    form.storage.setItem(form.key, { [commonField.name]: storageValue });

    const valueForm = createMargaritaForm<MFF>({
      name: formName,
      fields: [commonField],
    });

    const commonControlValue = valueForm.getControl([commonField.name]);
    if (!commonControlValue) throw 'No control found!';
    expect(commonControlValue.value).toBe(storageValue);
    valueForm.cleanup();
  });
});
