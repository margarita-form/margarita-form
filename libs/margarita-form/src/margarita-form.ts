import type { Extensions, MFF } from './margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';

export class MargaritaForm<FIELD extends MFF = MFF> extends MargaritaFormControl<FIELD> {
  constructor(public override field: FIELD) {
    super(field, { idStore: new Set<string>(), extensions: {} as Extensions });
  }
}
