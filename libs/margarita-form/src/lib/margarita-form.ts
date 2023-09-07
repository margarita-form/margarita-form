import type { MFF } from './margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';

export class MargaritaForm<FIELD extends MFF = MFF> extends MargaritaFormControl<FIELD> {
  constructor(public override field: FIELD) {
    super(field, {});

    const name = field.name;
    if (!name) throw new Error('Form name is required!');

    console.log('----------');
    console.log('Starting loopediloop');
    this.managers.value.refreshSync();
    console.log('Loopediloop done');
    console.log('----------');
  }
}
