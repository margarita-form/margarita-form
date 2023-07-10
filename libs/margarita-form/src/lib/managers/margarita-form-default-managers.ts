import { FieldManager } from './margarita-form-field-manager';
import { ControlsManager } from './margarita-form-controls-manager';
import { ParamsManager } from './margarita-form-params-manager';
import { RefManager } from './margarita-form-ref-manager';
import { StateManager } from './margarita-form-state-manager';
import { ValueManager } from './margarita-form-value-manager';
import { ConfigManager } from './margarita-form-config-manager';

export const margaritaFormControlManagers = {
  field: FieldManager,
  config: ConfigManager,
  value: ValueManager,
  controls: ControlsManager,
  state: StateManager,
  ref: RefManager,
  params: ParamsManager,
};

export const registerManager = (key: string, manager: any) => {
  Object.assign(margaritaFormControlManagers, {
    [key]: manager,
  });
};

export type MargaritaFormControlManagers = typeof margaritaFormControlManagers;
