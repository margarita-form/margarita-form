import { MF, BaseManager, MargaritaForm } from '@margarita-form/core';

class CustomManager<CONTROL extends MF> extends BaseManager {
  constructor(public control: CONTROL) {
    super();
    if (this.control instanceof MargaritaForm) {
      console.log('Hello from custom manager!', this.control);
    }
  }
}

export { CustomManager };
