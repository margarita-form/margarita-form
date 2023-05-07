import { BaseManager } from './margarita-form-base-manager';
import { MF, MargaritaFormConfig } from '../margarita-form-types';

export const getDefaultConfig = (): Required<MargaritaFormConfig> => ({
  addDefaultValidators: true,
  addMetadataToArrays: false,
  allowConcurrentSubmits: false,
  asyncFunctionWarningTimeout: 2000,
  clearStorageOnSuccessfullSubmit: true,
  detectInputElementValidations: true,
  disableFormWhileSubmitting: true,
  handleSuccesfullSubmit: 'disable',
  resetFormOnFieldChanges: false,
  showDebugMessages: false,
  useCacheForForms: true,
  useStorage: false,
  useSyncronization: false,
});

class ConfigManager<CONTROL extends MF> extends BaseManager {
  #config: MargaritaFormConfig = getDefaultConfig();

  constructor(public control: CONTROL) {
    super();
    this.updateConfig(control.field.config || {});

    this.createSubscription(control.fieldManager.changes, (field) => {
      if (field?.config) this.updateConfig(field.config);
    });
  }

  public get current(): MargaritaFormConfig {
    return this.#config;
  }

  public updateConfig(config: Partial<MargaritaFormConfig>) {
    const _config = { ...this.#config, ...config };
    this.#config = _config;
  }
}

export { ConfigManager };
