import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFF } from '../margarita-form-types';

class FieldManager<CONTROL extends MFC> extends BaseManager<CONTROL['field']> {
  public shouldResetControl = false;

  constructor(public override control: CONTROL) {
    super('field', control);
    this.setField(control.field);
  }

  private _emitChanges() {
    this.control.field = this.value as typeof this.control.field;
    this.emitChange(this.value);
  }

  public async setField<FIELD extends MFF = MFF | CONTROL['field']>(field: FIELD | Promise<FIELD>, resetControl = false) {
    if (!field) return;
    const fieldIsSame = this.value && field && this.value === field;
    if (fieldIsSame) return;
    this.value = await field;
    this.shouldResetControl = resetControl;
    this._emitChanges();
  }

  public async updateField<FIELD extends MFF = MFF | CONTROL['field']>(
    partialField: Partial<FIELD> | Promise<Partial<FIELD>>,
    resetControl = false
  ) {
    const resolved = await partialField;
    const patchField = { ...this.value, ...resolved } as CONTROL['field'];
    this.setField(patchField, resetControl);
  }
}

export { FieldManager };
