import { CommonRecord, MFC, MFF, createMargaritaForm } from '../../index';
import { SyncronizationExtensionBase } from '../extensions/syncronization/syncronization-extension-base';
import { BehaviorSubject, Observable } from 'rxjs';
import { BroadcasterMessage } from '../extensions/syncronization/syncronization-extension-types';
import { nanoid } from 'nanoid';

const behaviorSubject = new BehaviorSubject<BroadcasterMessage | null>(null);

class ValueSyncronization extends SyncronizationExtensionBase {
  public value: null | CommonRecord = null;

  constructor(public override root: MFC) {
    super(root);
  }

  public override postMessage(message: BroadcasterMessage): void {
    behaviorSubject.next(message);
  }

  public override listenToMessages<DATA>(): Observable<BroadcasterMessage<DATA>> {
    return behaviorSubject.asObservable() as Observable<BroadcasterMessage<DATA>>;
  }
}

describe('syncronization extension testing', () => {
  it('Check that syncronization works corretly', async () => {
    const formName = nanoid();

    const form1 = createMargaritaForm<MFF>(
      {
        name: formName,
        initialValue: 'hello!',
        extensions: [ValueSyncronization],
      },
      false
    );

    const form2 = createMargaritaForm<MFF>(
      {
        name: formName,
        initialValue: 'hello!',
      },
      false
    );

    const form3 = createMargaritaForm<MFF>(
      {
        name: formName,
        initialValue: 'hello!',
        extensions: [ValueSyncronization],
      },
      false
    );

    expect(form1.value).toEqual(form2.value);
    expect(form1.value).toEqual(form3.value);
    expect(form2.value).toEqual(form3.value);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    form1.setValue('Hello world!');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(form1.value).not.toEqual(form2.value);
    expect(form1.value).toEqual(form3.value);
    expect(form2.value).not.toEqual(form3.value);
  });
});
