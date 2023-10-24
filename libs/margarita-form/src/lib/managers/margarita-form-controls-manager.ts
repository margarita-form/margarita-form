import { filter } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { BaseManager } from './margarita-form-base-manager';
import { DeepControlIdentifier, MFF, MFC, MFCA, MFCG } from '../margarita-form-types';
import { MargaritaFormI18NExtension } from '../extensions/margarita-form-i18n-extension';
import { startAfterInitialize } from './margarita-form-create-managers';

class ControlsManager<CONTROL extends MFC = MFC> extends BaseManager<MFC[]> {
  private _buildWith: CONTROL['field'] | null = null;
  private _requireUniqueNames: boolean;

  constructor(public override control: CONTROL) {
    super('controls', control, []);
    const { fields } = this.control.field;
    const fieldsAreValid = !fields || Array.isArray(fields);
    if (!fieldsAreValid) {
      throw 'Invalid fields provided for field at: ' + (this.control.isRoot ? 'root' : this.control.getPath().join(' > '));
    }

    this._requireUniqueNames = !this.control.expectArray;

    if (this.control.field) {
      this.rebuild();
    }
  }

  public override onInitialize() {
    this.createSubscription(this.control.managers.field.changes.pipe(filter((field) => field !== this._buildWith)), () =>
      this.rebuild(this.control.managers.field.shouldResetControl)
    );
  }

  public override onCleanup() {
    this.value.forEach((control) => {
      control.cleanup();
    });
  }

  public rebuild(resetControls = false) {
    const { field } = this.control;
    if (!field) throw 'No field provided for control!';
    this._buildWith = field;
    const { startWith = 1, fields } = field;

    if (this._buildWith && fields && this.control.expectGroup) {
      const controlsToRemove = this.value.filter((control) => {
        return !fields.some((field: MFF) => field.name === control.name);
      });

      controlsToRemove.forEach((control) => {
        control.remove();
      });
    }

    if (this.control.expectArray) {
      if (!fields) throw 'No fields provided for array grouping!';
      const fieldNames = new Set(fields.map((field) => field.name));
      const hasDifferentFields = fieldNames.size > 1;
      const { addMetadata } = this.control.config;
      if (hasDifferentFields) {
        const path = this.control.getPath().join('.');
        if (!addMetadata) {
          throw `Control "${path}" has different fields specified for array grouping without metadata being added to them! Please add "addMetadata" to the control config.`;
        }

        const someFieldsAreNotMaps = fields.filter((field) => !field.fields || ![undefined, 'group'].includes(field.grouping));

        if (someFieldsAreNotMaps.length > 0) {
          const fieldNames = someFieldsAreNotMaps.map((field) => field.name).join(', ');
          throw `Control "${path}" has fields (${fieldNames}) where metadata cannot be added! To fix this, only add fields to the array where child fields are expected and grouping is not array or flat.`;
        }
      }

      const startFrom = this.value.length;
      const shouldBuildArray = resetControls || startFrom <= 0;
      if (shouldBuildArray && !Array.isArray(this.control.value)) {
        // Skip if value is already set as it determines the length of the array
        const startWithArray = Array.isArray(startWith)
          ? startWith.map((name) => fields.find((field: MFF) => field.name === name))
          : Array.from({ length: startWith }, () => fields[0]);

        startWithArray.forEach((field) => {
          if (!field) throw 'Invalid field provided for array grouping!';
          this.addControl(field, resetControls, false);
        });
      }
    } else if (fields) {
      const hasDuplicateNames = fields.filter((field, index) => fields.findIndex((f) => f.name === field.name) !== index);
      if (hasDuplicateNames.length > 0) {
        const duplicateNames = hasDuplicateNames.map((field) => field.name).join(', ');
        throw `Duplicate field names (${duplicateNames}) found for control "${this.control.name}"d! Please make sure all field names are unique when grouping is not set to "array".`;
      }
      this.addControls(fields, resetControls, false);
    }

    this._emitChanges(false);
  }

  private _emitChanges(syncValue = true) {
    this.emitChange(this.value);
    if (syncValue) this.control.managers.value.refreshSync(true, false);
    if (this.control.initialized) startAfterInitialize(this.control);
    if (syncValue && this.control.initialized) this.control.updateStateValue('dirty', true);
  }

  public get hasControls(): boolean {
    try {
      return this.value.length > 0;
    } catch (error) {
      console.trace(error);
      return false;
    }
  }

  get group(): MFCG {
    const entries = this.value.map((control) => [control.name, control]);
    const obj = Object.fromEntries(entries);
    return obj;
  }

  get array(): MFCA {
    return this.value;
  }

  public appendRepeatingControls<FIELD extends MFF = MFF>(fieldTemplates?: string[] | FIELD[]): MFC<FIELD>[] {
    if (!fieldTemplates) throw 'No fields provided for "appendRepeatingControls" controls!';
    return fieldTemplates.map((field) => this.appendRepeatingControl(field)).filter((control) => !!control) as MFC<FIELD>[];
  }

  public appendRepeatingControl<FIELD extends MFF = MFF>(
    fieldTemplate?: string | number | FIELD,
    overrides: Partial<FIELD> = {}
  ): null | MFC<FIELD> {
    const { fields } = this.control.field as MFF<any, FIELD>;

    const getField = (): undefined | FIELD => {
      if (fields) {
        if (!fieldTemplate) return fields[0];
        if (typeof fieldTemplate === 'string') return fields.find((field: MFF) => field.name === fieldTemplate);
        if (typeof fieldTemplate === 'number') return fields[fieldTemplate];
      }
      if (typeof fieldTemplate === 'object') return fieldTemplate;
      return undefined;
    };

    const field = getField();
    if (!field) {
      if (this.control.expectArray) throw 'Invalid field provided for "appendRepeatingControl" controls!';
      return null;
    }
    const asd = { ...field, ...overrides };
    return this.addControl(asd);
  }

  public addControls<FIELD extends MFF = CONTROL['field']>(fields: FIELD[], resetControl = false, emit = true): MFC<FIELD>[] {
    if (!fields) throw 'No fields provided!';
    return fields.map((field) => {
      return this.addControl(field, resetControl, emit);
    });
  }

  public addControl<FIELD extends MFF = CONTROL['field']>(field: FIELD, resetControl = false, emit = true): MFC<FIELD> {
    if (!field) throw 'No field provided!';

    const shouldLocalize = field.localize && this.control.locales;

    if (shouldLocalize) {
      const localizedField = MargaritaFormI18NExtension.localizeField(this.control, field);
      return this.addControl(localizedField as FIELD, resetControl, emit);
    }

    if (this.control.expectGroup && !resetControl) {
      const existingControl = this.getControl(field.name);
      if (existingControl) {
        existingControl.updateField(field);
        return existingControl as MFC<FIELD>;
      }
    }

    const control = new MargaritaFormControl<FIELD>(field, {
      parent: this.control,
      root: this.control.root,
      initialIndex: this.value.length,
      idStore: this.control.context.idStore,
    });

    return this.appendControl(control as any, resetControl, emit);
  }

  public appendControl<CHILD_CONTROL extends MFC>(control: CHILD_CONTROL, resetControl = false, emit = true): CHILD_CONTROL {
    if (this._requireUniqueNames) {
      const prevControl = this.getControl(control.name);
      if (resetControl) {
        this.removeControl(control.name);
      } else if (prevControl) {
        prevControl.managers.field.setField(control.field);
        if (emit) this._emitChanges();
        return prevControl as CHILD_CONTROL;
      }
    }

    this.value.push(control);
    if (emit) this._emitChanges();
    return control;
  }

  private _removeCleanup(control: MFC) {
    if (control) {
      control.cleanup();
    }
  }

  public removeControl(identifier: string | number, emit = true) {
    if (typeof identifier === 'number') {
      const [removed] = this.value.splice(identifier, 1);
      this._removeCleanup(removed);
    } else {
      const index = this.value.findIndex((control) => [control.name, control.key, control.uid].includes(identifier));
      if (index > -1) {
        const [control] = this.value.splice(index, 1);
        this._removeCleanup(control);
        const { onRemove } = control.field;
        if (onRemove) onRemove({ control });
      }
    }
    if (emit) this._emitChanges();
  }

  public getControl(identifier: DeepControlIdentifier<CONTROL['field']>): MFC | undefined {
    if (typeof identifier === 'number') {
      if (identifier < 0) return this.value[this.value.length + identifier];
      return this.value[identifier];
    }
    if (typeof identifier === 'string') {
      const actuallyNumber = Number(identifier);
      if (!isNaN(actuallyNumber)) {
        return this.getControl(actuallyNumber);
      }
      if (identifier === '..') this.control.parent;
      if (identifier === '.') return this.control.root;
      if (identifier.includes('.')) {
        const [first, ...rest] = identifier.split('.');
        if (!first) return this.control.getControl(rest);
        const control = this.getControl(first);
        if (!control) return;
        return control.getControl(rest);
      }
    }
    return this.value.find((control) => {
      const identifiers: unknown[] = [control.name, control.key, control.uid];
      return identifiers.includes(identifier);
    });
  }

  public getControlIndex(identifier: string | MFC) {
    if (identifier instanceof MargaritaFormControl) {
      return this.value.findIndex((control) => control === identifier);
    }
    return this.value.findIndex((control) => [control.name, control.key].includes(identifier));
  }

  public moveControl(identifier: string, toIndex: number, emit = true) {
    const currentIndex = this.getControlIndex(identifier);
    const [item] = this.value.splice(currentIndex, 1);
    this.value.splice(toIndex, 0, item);
    if (emit) this._emitChanges(true);
  }
}

export { ControlsManager };
