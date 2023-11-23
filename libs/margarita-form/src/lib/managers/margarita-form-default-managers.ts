import { FieldManager } from './margarita-form-field-manager';
import { ControlsManager } from './margarita-form-controls-manager';
import { ParamsManager } from './margarita-form-params-manager';
import { RefManager } from './margarita-form-ref-manager';
import { StateManager } from './margarita-form-state-manager';
import { ValueManager } from './margarita-form-value-manager';
import { ConfigManager } from './margarita-form-config-manager';
import { EventsManager } from './margarita-form-events-manager';
import { MargaritaFormControl } from '../margarita-form-control';

export const margaritaFormDefaultManagers = [
  FieldManager,
  ConfigManager,
  ValueManager,
  ControlsManager,
  StateManager,
  RefManager,
  ParamsManager,
  EventsManager,
];

margaritaFormDefaultManagers.forEach((manager) => {
  MargaritaFormControl.addManager(manager);
});
