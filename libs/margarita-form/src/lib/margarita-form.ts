import type { MFF } from './margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';

export class MargaritaForm<VALUE = unknown, FIELD extends MFF<FIELD> = MFF> extends MargaritaFormControl<VALUE, FIELD> {
  constructor(public override field: FIELD) {
    super(field, {});
    this.managers.value._syncChildValues(false, true);
  }
}
