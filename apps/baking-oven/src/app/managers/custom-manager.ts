import { MF, BaseManager, MargaritaForm, MFC, ManagerName } from '@margarita-form/core';

declare module '@margarita-form/core' {
  export interface Managers {
    custom: CustomManager<MFC>;
  }
}

class CustomManager<CONTROL extends MF> extends BaseManager {
  public static override managerName: ManagerName = 'custom';
  constructor(public control: CONTROL) {
    super(control);
    if (this.control instanceof MargaritaForm) {
      console.log('Hello from custom manager!', this.control);
    }
  }
}

export { CustomManager };
