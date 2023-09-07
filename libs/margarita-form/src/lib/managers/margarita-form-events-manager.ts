import { BaseManager } from './margarita-form-base-manager';
import { MFC } from '../margarita-form-types';

class EventsManager<CONTROL extends MFC = MFC> extends BaseManager {
  constructor(public control: CONTROL) {
    super();
  }

  public override _init(): void {
    this.createSubscription(this.control.changes, ({ name, change: value, control }) => {
      const { onChanges, onValueChanges, onStateChanges } = control.field;
      if (onChanges) onChanges({ control, value, params: name });
      if (name === 'value' && onValueChanges) onValueChanges({ control, value });
      if (name === 'state' && onStateChanges) onStateChanges({ control, value });
    });
  }
}

export { EventsManager };
