import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFF, MargaritaFormConfig } from '../margarita-form-types';

export const getDefaultConfig = (): Required<MargaritaFormConfig> => ({
  addDefaultValidators: true,
  addMetadataToArrays: false,
  allowUnresolvedArrayChildNames: false,
  detectAndRemoveMetadataForArrays: false,
  allowConcurrentSubmits: false,
  asyncFunctionWarningTimeout: 2000,
  clearStorageOnSuccessfullSubmit: true,
  detectInputElementValidations: true,
  disableFormWhileSubmitting: true,
  handleSuccesfullSubmit: 'disable',
  resetFormOnFieldChanges: false,
  showDebugMessages: false,
  useCacheForForms: true,
  storageKey: 'key',
  syncronizationKey: 'key',
  allowInvalidSubmit: false,
});

class ConfigManager<CONTROL extends MFC = MFC> extends BaseManager {
  private _config: MargaritaFormConfig = getDefaultConfig();

  constructor(public control: CONTROL) {
    super();
    this.updateConfig(control.field.config || {});
  }

  public override _init(): void {
    this.createSubscription(this.control.managers.field.changes, (field) => {
      if (field?.config) this.updateConfig(field.config);
    });
  }

  public get current(): MargaritaFormConfig {
    return this._config;
  }

  public updateConfig(config: Partial<MargaritaFormConfig>) {
    const _config = { ...this._config, ...config };
    this._config = _config;
  }

  public static generateConfig(field: MFF): MargaritaFormConfig {
    const defaultConfig = getDefaultConfig();
    if (field.config) {
      return { ...defaultConfig, ...field.config };
    }
    return defaultConfig;
  }
}

export { ConfigManager };
