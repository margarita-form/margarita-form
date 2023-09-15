import type { MFC, MFF } from './margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';
import { startAfterInitialize } from './managers/margarita-form-create-managers';

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
    startAfterInitialize(this as MFC);
  }
}
