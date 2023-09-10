import type { MFF } from './margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';

export class MargaritaForm<FIELD extends MFF = MFF> extends MargaritaFormControl<FIELD> {
  constructor(public override field: FIELD) {
    super(field, { idStore: new Set<string>() });

    const name = field.name;
    if (!name) throw new Error('Form name is required!');

    // console.debug('----------');
    // console.debug('Starting loopediloop');
    this.managers.value.refreshSync();
    // console.debug('Loopediloop done');
    // console.debug('----------');
  }
}
