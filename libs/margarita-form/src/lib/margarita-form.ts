import type { MFF } from './margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';

export class MargaritaForm<VALUE = unknown, FIELD extends MFF<VALUE> = MFF<VALUE>> extends MargaritaFormControl<VALUE, FIELD> {
  constructor(public override field: FIELD) {
    super(field, {});

    const name = field.name;
    if (!name) throw new Error('Form name is required!');

    this.managers.value._syncChildValues(false, true);
  }
}
