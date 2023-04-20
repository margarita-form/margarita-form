import { BehaviorSubject } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFF } from '../margarita-form-types';

class FieldManager<CONTROL extends MFC> extends BaseManager {
  #field: CONTROL['field'] = null;
  public changes = new BehaviorSubject<CONTROL['field']>(null);

  constructor(public control: CONTROL) {
    super();
    this.#field = control.field;
  }

  #emitChanges() {
    this.control.field = this.#field;
    this.changes.next(this.#field);
  }

  public get current(): CONTROL['field'] {
    return this.#field;
  }

  public setField(field: MFF | CONTROL['field'], replaceControl = false) {
    this.#field = field;
    this.#emitChanges();
    this.control.controlsManager.rebuild(replaceControl);
  }

  public updateField(
    field: Partial<MFF | CONTROL['field']>,
    replaceControl = false
  ) {
    const patchField = { ...this.current, ...field };
    this.setField(patchField, replaceControl);
  }
}

export { FieldManager };
