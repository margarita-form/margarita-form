import { BehaviorSubject } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFF } from '../margarita-form-types';

class FieldManager<CONTROL extends MFC> extends BaseManager {
  #field: CONTROL['field'] = null;
  public changes = new BehaviorSubject<CONTROL['field']>(null);
  public shouldReplaceControl = false;
  constructor(public control: CONTROL) {
    super();
    this.setField(control.field);
  }

  #emitChanges() {
    this.control.field = this.#field;
    this.changes.next(this.#field);
  }

  public get current(): CONTROL['field'] {
    return this.#field;
  }

  public async setField<FIELD extends MFF = MFF | CONTROL['field']>(
    field: FIELD | Promise<FIELD>,
    replaceControl = false
  ) {
    this.#field = await field;
    this.shouldReplaceControl = replaceControl;
    this.#emitChanges();
  }

  public async updateField<FIELD extends MFF = MFF | CONTROL['field']>(
    partialField: Partial<FIELD> | Promise<Partial<FIELD>>,
    replaceControl = false
  ) {
    const resolved = await partialField;
    const patchField = { ...this.current, ...resolved };
    this.setField(patchField, replaceControl);
  }
}

export { FieldManager };
