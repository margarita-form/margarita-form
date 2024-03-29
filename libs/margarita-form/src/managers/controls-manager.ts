import { filter, skip } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { BaseManager, ManagerName } from './base-manager';
import { DeepControlIdentifier, MFF, MFC, MFCA, MFCG, MFGF } from '../typings/margarita-form-types';
import { coreResolver } from '../helpers/core-resolver';
import { resolve } from '../helpers/resolve-function-outputs';

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    controls: ControlsManager<MFC>;
  }
}

class ControlsManager<CONTROL extends MFC = MFC> extends BaseManager<MFC[]> {
  public static override managerName: ManagerName = 'controls';

  private _buildWith: CONTROL['field'] | null = null;
  private _requireUniqueNames: boolean;

  constructor(public override control: CONTROL) {
    super(control, []);
    this._requireUniqueNames = !this.control.expectArray;
  }

  public override prepare() {
    this.rebuild();
  }

  public override onInitialize() {
    this.createSubscription(
      this.control.managers.field.changes.pipe(
        skip(1),
        filter((field) => field !== this._buildWith)
      ),
      () => this.rebuild(this.control.managers.field.shouldResetControl)
    );
  }

  public override onCleanup() {
    this.value.forEach((control) => {
      control.cleanup();
    });
  }

  public rebuild(resetControls = false) {
    const { field, fields } = this.control;
    if (!field) throw 'No field provided for control!';
    this._buildWith = field;

    if (this._buildWith && fields && this.control.expectGroup) {
      const controlsToRemove = this.value.filter((control) => {
        return !fields.some((field: MFF) => field.name === control.field.name);
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

        const someFieldsAreNotMaps = fields.filter((field) => {
          const grouping = coreResolver(field.grouping, this.control, true);
          return ![undefined, 'group'].includes(grouping);
        });

        if (someFieldsAreNotMaps.length > 0) {
          throw `Control "${path}" has fields where metadata cannot be added! To fix this, only add fields to the array where child fields are expected and grouping is not array or flat.`;
        }
      }

      const startFrom = this.value.length;
      const shouldBuildArray = resetControls || startFrom <= 0;
      if (shouldBuildArray && !Array.isArray(this.control.value)) {
        const startWith = coreResolver<(string | number)[] | number>(field.startWith, this.control, false, 1);
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
        throw `Duplicate field names found for control "${this.control.name}"! Please make sure all field names are unique when grouping is not set to "array".`;
      }
      this.addControls(fields, resetControls, false);
    }

    this._emitChanges(false);
  }

  private _emitChanges(syncValue = true) {
    this.emitChange(this.value);

    if (this.control.ready) {
      this.control._startPrepareLoop();
      this.control._startOnInitializeLoop();
      this.control._startAfterInitializeLoop();
      this.control.managers.value.refreshSync(true, false);
    } else if (syncValue) this.control.managers.value.refreshSync(true, false);

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
    const { fields } = this.control;

    const getField = (): undefined | MFGF => {
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
    const merged = { ...field, ...overrides } as FIELD;
    return this.addControl(merged);
  }

  public addControls<FIELD extends MFF = CONTROL['field']>(fields: FIELD[], resetControl = false, emit = true): MFC<FIELD>[] {
    if (!fields) throw 'No fields provided!';
    return fields.map((field) => {
      return this.addControl(field, resetControl, emit);
    });
  }

  public addControl<FIELD extends MFF = CONTROL['field']>(field: FIELD, resetControl = false, emit = true): MFC<FIELD> {
    if (!field) throw 'No field provided!';

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
      idStore: this.control._buildParams.idStore,
      extensions: this.control._buildParams.extensions,
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
        if (onRemove) resolve({ getter: onRemove, control });
      }
    }
    if (emit) this._emitChanges();
  }

  public getControl(identifier: DeepControlIdentifier<CONTROL['field']>): MFC | undefined {
    if (typeof identifier === 'function') {
      const resolvedIdentifier = coreResolver(identifier, this.control);
      return this.getControl(resolvedIdentifier);
    }
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
