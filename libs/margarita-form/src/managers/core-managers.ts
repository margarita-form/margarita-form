import { FieldManager } from './field-manager';
import { ControlsManager } from './controls-manager';
import { StateManager } from './state-manager';
import { ValueManager } from './value-manager';
import { ConfigManager } from './config-manager';
import { EventsManager } from './events-manager';
import { MargaritaFormControl } from '../margarita-form-control';

export const margaritaFormCoreManagers = [FieldManager, ConfigManager, ValueManager, ControlsManager, StateManager, EventsManager];

margaritaFormCoreManagers.forEach((manager) => {
  MargaritaFormControl.addManager(manager);
});
