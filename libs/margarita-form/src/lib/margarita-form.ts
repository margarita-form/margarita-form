import type { MargaritaFormOptions } from './margarita-form-types';
import { MargaritaFormGroup } from './margarita-form-group';

export class MargaritaForm<T = unknown> extends MargaritaFormGroup<T> {
  constructor(public options: MargaritaFormOptions) {
    if (!options) throw 'No options provided!';
    const { fields } = options;
    super({ name: 'root', fields });
  }
}
