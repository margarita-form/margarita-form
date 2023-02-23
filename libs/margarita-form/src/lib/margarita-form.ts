import type { MargaritaFormOptions } from './margarita-form-types';
import { MargaritaFormGroup } from './margarita-form-group';

export class MargaritaForm<T = unknown> extends MargaritaFormGroup<T> {
  constructor(public options: MargaritaFormOptions) {
    if (!options) throw 'No options provided!';
    const { fields, validators } = options;
    super({ name: 'root', fields }, null, null, validators);
  }
}
