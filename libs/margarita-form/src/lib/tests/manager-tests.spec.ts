import { nanoid } from 'nanoid';
import { BaseManager, MFC, MargaritaForm, createMargaritaForm } from '../../index';

class CustomManager extends BaseManager {
  constructor(public override control: MFC) {
    super('custom-1', control);
  }
}

class ManagerThatDependsOnNonExistingManager extends BaseManager {
  public firstControl: MFC;
  constructor(public override control: MFC) {
    super('custom-2', control);
    const managers = this.control.managers as any;
    const firstControlManager = managers['custom-3'] as FirstControlManager;
    this.firstControl = firstControlManager.firstControl;
  }
}

class FirstControlManager extends BaseManager {
  public firstControl: MFC;
  constructor(public override control: MFC) {
    super('custom-3', control);
    this.firstControl = this.control.controls[0];
  }
}

describe('Manager constructor testing', () => {
  it('Managers should be constructed in correct order', () => {
    const form1 = createMargaritaForm({
      name: nanoid(),
    });
    expect(form1.managers).toBeDefined();
    expect(form1.managers).toHaveProperty('config');
    expect(form1.managers).toHaveProperty('controls');
    expect(form1.managers).toHaveProperty('events');
    expect(form1.managers).toHaveProperty('field');
    expect(form1.managers).toHaveProperty('params');
    expect(form1.managers).toHaveProperty('ref');
    expect(form1.managers).toHaveProperty('state');
    expect(form1.managers).toHaveProperty('value');
    expect(form1.managers).not.toHaveProperty('custom-1');
    expect(form1.managers).not.toHaveProperty('custom-2');
    expect(form1.managers).not.toHaveProperty('custom-3');

    MargaritaForm.addManager('custom-1', CustomManager);

    const form2 = createMargaritaForm({
      name: nanoid(),
    });
    expect(form2.managers).toHaveProperty('custom-1');
    expect(form2.managers).not.toHaveProperty('custom-2');
    expect(form2.managers).not.toHaveProperty('custom-3');

    MargaritaForm.addManager('custom-2', ManagerThatDependsOnNonExistingManager);

    const create = () =>
      createMargaritaForm({
        name: nanoid(),
      });

    expect(create).toThrowError();

    MargaritaForm.removeManager('custom-2');
    MargaritaForm.addManager('custom-3', FirstControlManager);
    MargaritaForm.addManager('custom-2', ManagerThatDependsOnNonExistingManager);

    const form3 = createMargaritaForm({
      name: nanoid(),
    });

    expect(form3.managers).toHaveProperty('custom-1');
    expect(form3.managers).toHaveProperty('custom-2');
    expect(form3.managers).toHaveProperty('custom-3');

    expect((form3.managers as any)['custom-2'].firstControl).toBe(form3.controls[0]);
    expect((form3.managers as any)['custom-3'].firstControl).toBe(form3.controls[0]);
  });
});
