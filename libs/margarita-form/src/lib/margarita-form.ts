import type { MFC, MFF } from './margarita-form-types';
import { MargaritaFormControl } from './margarita-form-control';
import { startAfterInitializeLoop, startOnInitializeLoop, startPrepareLoop } from './managers/margarita-form-create-managers';

export class MargaritaForm<FIELD extends MFF = MFF> extends MargaritaFormControl<FIELD> {
  constructor(public override field: FIELD) {
    super(field, { idStore: new Set<string>() });

    const name = field.name;
    if (!name) throw new Error('Form name is required!');

    startPrepareLoop(this as MFC);
    startOnInitializeLoop(this as MFC);
    startAfterInitializeLoop(this as MFC);
    this.managers.value.refreshSync();
  }
}
