import { FieldManager } from './margarita-form-field-manager';
import { ControlsManager } from './margarita-form-controls-manager';
import { StateManager } from './margarita-form-state-manager';
import { ValueManager } from './margarita-form-value-manager';
import { ConfigManager } from './margarita-form-config-manager';
import { EventsManager } from './margarita-form-events-manager';
import { MargaritaFormControl } from '../margarita-form-control';

export const margaritaFormCoreManagers = {
  field: FieldManager,
  config: ConfigManager,
  value: ValueManager,
  controls: ControlsManager,
  state: StateManager,
  events: EventsManager,
};

Object.entries(margaritaFormCoreManagers).forEach(([name, manager]) => {
  MargaritaFormControl.addManager(name, manager);
});
