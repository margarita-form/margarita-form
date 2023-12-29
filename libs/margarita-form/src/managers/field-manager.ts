import { BaseManager, ManagerName } from './base-manager';
import { MFC, MFF } from '../typings/margarita-form-types';
import { coreResolver } from '../helpers/core-resolver';
import { valueExists } from '../helpers/check-value';

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    field: FieldManager<MFC>;
  }
}

class FieldManager<CONTROL extends MFC> extends BaseManager<CONTROL['field']> {
  public static override managerName: ManagerName = 'field';
  public shouldResetControl = false;

  constructor(public override control: CONTROL) {
    super(control);
    this.setField(control.field);
  }

  private _emitChanges() {
    this.control.field = this.value as typeof this.control.field;
    this.emitChange(this.value);
  }

  public getChildFields = <FIELD extends MFF = MFF | CONTROL['field']>(): FIELD[] => {
    const { fields } = this.value;
    if (!fields) return [];
    if (!Array.isArray(fields)) {
      throw 'Invalid fields provided for field at: ' + (this.control.isRoot ? 'root' : this.control.getPath().join(' > '));
    }
    const resolvedFields = fields
      .map((field) => {
        if (typeof field === 'function') return coreResolver<MFF>(field, this.control, true);
        return field;
      })
      .filter(valueExists);

    return resolvedFields as FIELD[];
  };

  public setField<FIELD extends MFF = MFF | CONTROL['field']>(field: FIELD, resetControl = false) {
    if (!field) return;
    const fieldIsSame = this.value && field && this.value === field;
    if (fieldIsSame) return;
    this.value = field;
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
