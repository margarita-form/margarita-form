import { BehaviorSubject } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFF } from '../margarita-form-types';
import { isEqual } from '../helpers/check-value';

class FieldManager<CONTROL extends MFC> extends BaseManager {
  private _field: CONTROL['field'] = null;
  public changes = new BehaviorSubject<CONTROL['field']>(null);
  public shouldResetControl = false;
  constructor(public control: CONTROL) {
    super();
    this.setField(control.field);
  }

  private _emitChanges() {
    this.control.field = this._field;
    this.changes.next(this._field);
  }

  public get current(): CONTROL['field'] {
    return this._field;
  }

  public async setField<FIELD extends MFF = MFF | CONTROL['field']>(field: FIELD | Promise<FIELD>, resetControl = false) {
    const fieldIsSame = isEqual(this._field, field);
    if (fieldIsSame) return;
    this._field = await field;
    this.shouldResetControl = resetControl;
    this._emitChanges();
  }

  public async updateField<FIELD extends MFF = MFF | CONTROL['field']>(
    partialField: Partial<FIELD> | Promise<Partial<FIELD>>,
    resetControl = false
  ) {
    const resolved = await partialField;
    const patchField = { ...this.current, ...resolved };
    this.setField(patchField, resetControl);
  }
}

export { FieldManager };
