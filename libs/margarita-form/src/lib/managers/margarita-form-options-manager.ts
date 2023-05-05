import { BaseManager } from './margarita-form-base-manager';
import { MF, MargaritaFormOptions } from '../margarita-form-types';

export const getDefaultOptions = (): MargaritaFormOptions => ({
  detectInputElementValidations: true,
  asyncFunctionWarningTimeout: 2000,
  disableFormWhileSubmitting: true,
  handleSuccesfullSubmit: 'disable',
  allowConcurrentSubmits: false,
  addDefaultValidators: true,
  addMetadataToArrays: false,
  useStorage: undefined,
  clearStorageOnSuccessfullSubmit: true,
});

class OptionsManager<CONTROL extends MF> extends BaseManager {
  _options: MargaritaFormOptions = getDefaultOptions();

  constructor(public control: CONTROL, public customOptions: MargaritaFormOptions) {
    super();
    this.updateOptions(customOptions);

    this.createSubscription(control.fieldManager.changes, (field) => {
      if (field) this.updateOptions(customOptions);
    });
  }

  public get current(): MargaritaFormOptions {
    return this._options;
  }

  public updateOptions(options: Partial<MargaritaFormOptions>) {
    const _options = { ...this._options, ...options };
    this._options = _options;
  }
}

export { OptionsManager };
