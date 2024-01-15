import type { Extensions, MFF } from './typings/margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';

export class MargaritaForm<FIELD extends MFF<any> = MFF> extends MargaritaFormControl<FIELD> {
  constructor(public _field: FIELD) {
    super(_field, { idStore: new Set<string>(), extensions: {} as Extensions });
  }
}
