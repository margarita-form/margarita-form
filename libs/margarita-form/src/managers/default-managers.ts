import { FieldManager } from './field-manager';
import { ControlsManager } from './controls-manager';
import { ParamsManager } from './params-manager';
import { RefManager } from './ref-manager';
import { StateManager } from './state-manager';
import { ValueManager } from './value-manager';
import { ConfigManager } from './config-manager';
import { EventsManager } from './events-manager';
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
