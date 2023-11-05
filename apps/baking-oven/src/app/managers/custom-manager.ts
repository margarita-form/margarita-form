import { MF, BaseManager, MargaritaForm, MFC } from '@margarita-form/core';

declare module '@margarita-form/core' {
  export interface Managers {
    custom: CustomManager<MFC>;
  }
}

class CustomManager<CONTROL extends MF> extends BaseManager {
  constructor(public control: CONTROL) {
    super('custom-manager', control);
    if (this.control instanceof MargaritaForm) {
      console.log('Hello from custom manager!', this.control);
    }
  }
}

export { CustomManager };
