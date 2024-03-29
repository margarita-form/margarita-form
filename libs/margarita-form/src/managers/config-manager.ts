import { BaseManager, ManagerName } from './base-manager';
import { MFC, MargaritaFormConfig } from '../typings/margarita-form-types';
import { MargaritaFormControl } from '../margarita-form-control';

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    config: ConfigManager<MFC>;
  }
}

export const getDefaultConfig = (): MargaritaFormConfig => ({
  addMetadata: false,
  afterChangesDebounceTime: 10,
  allowUnresolvedArrayChildNames: false,
  allowConcurrentSubmits: false,
  allowValueToBeFunction: false,
  asyncFunctionWarningTimeout: 5000,
  appendNodeValidationsToControl: true,
  appendControlValidationsToNode: true,
  resolveNodeTypeValidationsToControl: true,
  disableFormWhileSubmitting: true,
  handleSuccesfullSubmit: 'disable',
  resetFormOnFieldChanges: false,
  showDebugMessages: false,
  allowInvalidSubmit: false,
  transformUndefinedToNull: false,
  allowEmptyString: false,
  requiredNameCase: false,
  runTransformersForInitialValues: true,
  sortValues: false,
});

class ConfigManager<CONTROL extends MFC = MFC> extends BaseManager<MargaritaFormConfig> {
  public static override managerName: ManagerName = 'config';
  constructor(public override control: CONTROL) {
    const defaultConfig = getDefaultConfig();
    super(control, defaultConfig);
    this.updateConfig();
  }

  public override onInitialize(): void {
    this.createSubscription(this.control.managers.field.changes, () => {
      this.updateConfig();
    });
  }

  public updateConfig() {
    const globalConfig = MargaritaFormControl.config;
    const parentConfig = this.control.isRoot ? {} : this.control.parent.config;
    const config = ConfigManager.joinConfigs(globalConfig, parentConfig, this.control.config);
    this.value = config;
  }

  public static joinConfigs(...configs: (undefined | Partial<MargaritaFormConfig>)[]): MargaritaFormConfig {
    const defaultConfig = getDefaultConfig();
    const config = configs.reduce((acc, config) => (config ? { ...acc, ...config } : acc), defaultConfig) as MargaritaFormConfig;
    return config;
  }
}

export { ConfigManager };
