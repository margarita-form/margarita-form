import { BaseManager } from './margarita-form-base-manager';
import { MFC } from '../margarita-form-types';

// Extends types
declare module '@margarita-form/core' {
  export interface Managers {
    events: EventsManager<MFC>;
  }
}

class EventsManager<CONTROL extends MFC = MFC> extends BaseManager {
  constructor(public override control: CONTROL) {
    super('events', control);
  }

  public override afterInitialize(): void {
    this.createSubscription(this.control.changes, ({ name, change: value, control }) => {
      const { onChanges, onValueChanges, onStateChanges } = control.field;
      if (onChanges) onChanges({ control, value, params: name });
      if (name === 'value' && onValueChanges) onValueChanges({ control, value });
      if (name === 'state' && onStateChanges) onStateChanges({ control, value });
    });
  }
}

export { EventsManager };
