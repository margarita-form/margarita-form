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
  #options: MargaritaFormOptions = getDefaultOptions();

  constructor(public control: CONTROL, public customOptions: MargaritaFormOptions) {
    super();
    this.updateOptions(customOptions);

    this.createSubscription(control.fieldManager.changes, (field) => {
      if (field) this.updateOptions(customOptions);
    });
  }

  public get current(): MargaritaFormOptions {
    return this.#options;
  }

  public updateOptions(options: Partial<MargaritaFormOptions>) {
    const _options = { ...this.#options, ...options };
    this.#options = _options;
  }
}

export { OptionsManager };
