import { BehaviorSubject, filter } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFCA, MFCG, MFF, MargaritaFormHandleLocalize } from '../margarita-form-types';
import { nanoid } from 'nanoid';

class ControlsManager<CONTROL extends MFC> extends BaseManager {
  public changes = new BehaviorSubject<MFC[]>([]);
  private _buildWith: CONTROL['field'] = null;
  private _controls: MFC[] = [];
  private _requireUniqueNames: boolean;

  constructor(public control: CONTROL) {
    super();

    this._requireUniqueNames = !this.control.expectArray;

    this.onCleanup = () => {
      this._controls.forEach((control) => {
        control.cleanup();
      });
    };

    this.onResubscribe = () => {
      this._controls.forEach((control) => {
        control.resubscribe();
      });
    };

    if (this.control.field) {
      this.rebuild();
    }
  }

  public override _init() {
    this.createSubscription(this.control.managers.field.changes.pipe(filter((field) => field !== this._buildWith)), () =>
      this.rebuild(this.control.managers.field.shouldResetControl)
    );
  }

  private rebuild(resetControls = false) {
    const { grouping, field } = this.control;
    if (!field) throw 'No field provided for control!';
    this._buildWith = field;
    const { startWith = 1, fields, template } = field;

    if (this._buildWith && field.fields && this.control.expectGroup) {
      const controlsToRemove = this._controls.filter((control) => {
        return !field.fields.some((field: MFF) => field.name === control.name);
      });

      controlsToRemove.forEach((control) => {
        control.remove();
      });
    }

    if (this.control.expectArray) {
      const startFrom = this._controls.length;
      if (resetControls || startFrom <= 0) {
        for (let i = startFrom; i < startWith; i++) {
          if (grouping === 'repeat-group') {
            const _template = fields ? { fields } : template;
            this.addTemplatedControl(_template, resetControls, false);
          }

          if (grouping === 'array') {
            if (fields) {
              this.addControls(fields, resetControls, false);
            } else {
              this.addTemplatedControl(template, resetControls, false);
            }
          }
        }
      }
    } else if (fields) {
      this.addControls(fields, resetControls, false);
    }

    this._emitChanges(false);
  }

  private _emitChanges(syncValue = true) {
    this.changes.next(this._controls);
    if (syncValue) this.control.managers.value._syncChildValues(false, true);
  }

  public get hasControls(): boolean {
    try {
      return this._controls.length > 0;
    } catch (error) {
      console.trace(error);
      return false;
    }
  }

  get group(): MFCG {
    const entries = this._controls.map((control) => [control.name, control]);
    const obj = Object.fromEntries(entries);
    return obj;
  }

  get array(): MFCA {
    return this._controls;
  }

  public addControls<FIELD extends MFF = CONTROL['field'], VALUE = unknown>(
    fields: FIELD[],
    resetControl = false,
    emit = true
  ): MargaritaFormControl<VALUE, FIELD>[] {
    if (!fields) throw 'No fields provided!';
    return fields.map((field) => {
      return this.addControl(field, resetControl, emit);
    });
  }

  public addTemplatedControl<CHILD_FIELD extends MFF = CONTROL['field']>(
    fieldTemplate?: Partial<CHILD_FIELD>,
    resetControl = false,
    emit = true
  ): MargaritaFormControl<unknown, CHILD_FIELD> {
    if (!fieldTemplate) throw 'No template for repeating field provided!';

    const { fields, template = {} } = this.control.field;
    const _template = fields ? { fields, ...template } : template;

    const field = {
      name: nanoid(4),
      ..._template,
      ...fieldTemplate,
    } as CHILD_FIELD;

    return this.addControl<CHILD_FIELD>(field, resetControl, emit);
  }

  public addControl<FIELD extends MFF = CONTROL['field'], VALUE = unknown>(
    field: FIELD,
    resetControl = false,
    emit = true
  ): MargaritaFormControl<VALUE, FIELD> {
    if (!field) throw 'No field provided!';

    const shouldLocalize = field.localize && this.control.locales;

    if (shouldLocalize) {
      const locales = this.control.locales || [];
      const initialValue = field.initialValue && typeof field.initialValue === 'object' ? field.initialValue : undefined;

      const fallbackFn = () => ({});
      const { parent = fallbackFn, child = fallbackFn } = this.control.getRootFieldValue<MargaritaFormHandleLocalize<FIELD>>(
        'handleLocalize',
        {}
      );

      const localizedField: FIELD = {
        ...field,
        localize: false,
        wasLocalized: true,
        validation: null,
        initialValue,
        ...parent({ field, parent: this.control, locales }),
        fields: locales.map((locale) => {
          return {
            ...field,
            locale,
            localize: false,
            isLocale: true,
            name: locale,
            initialValue: initialValue ? undefined : field.initialValue,
            ...child({ field, parent: this.control, locale }),
          };
        }),
      };

      if (!resetControl) {
        const existingControl = this.getControl(field.name);
        if (existingControl) {
          existingControl.updateField(localizedField);
          return existingControl as MargaritaFormControl<VALUE, FIELD>;
        }
      }

      return this.addControl(localizedField, resetControl, emit);
    }

    if (this.control.expectGroup && !resetControl) {
      const existingControl = this.getControl(field.name);
      if (existingControl) {
        existingControl.updateField(field);
        return existingControl as MargaritaFormControl<VALUE, FIELD>;
      }
    }

    const control = new MargaritaFormControl<VALUE, FIELD>(field, {
      parent: this.control,
      root: this.control.root,
      form: this.control.form,
      keyStore: this.control.keyStore,
      initialIndex: this._controls.length,
    });

    // TODO: Add test that new children gets disabled when parent is disabled
    // if (this.control.state?.disabled) control.disable();
    return this.appendControl(control, resetControl, emit);
  }

  public appendControl<CHILD_CONTROL extends MFC>(control: CHILD_CONTROL, resetControl = false, emit = true): CHILD_CONTROL {
    if (this._requireUniqueNames) {
      const prevControl = this.getControl<CHILD_CONTROL>(control.name);
      if (resetControl) {
        this.removeControl(control.name);
      } else if (prevControl) {
        prevControl.managers.field.setField(control.field);
        if (emit) this._emitChanges();
        return prevControl;
      }
    }

    this._controls.push(control);
    if (emit) this._emitChanges();
    return control;
  }

  private _removeCleanup(control: MFC) {
    if (control) {
      control.managers.value._syncParentValue();
      control.cleanup();
    }
  }

  public removeControl(identifier: string | number, emit = true) {
    if (typeof identifier === 'number') {
      const [removed] = this._controls.splice(identifier, 1);
      this._removeCleanup(removed);
    } else {
      const index = this._controls.findIndex((control) => [control.name, control.key].includes(identifier));
      if (index > -1) {
        const [control] = this._controls.splice(index, 1);
        this._removeCleanup(control);
      }
    }
    if (emit) this._emitChanges();
  }

  public getControl<CHILD_CONTROL extends MFC = MargaritaFormControl<unknown, CONTROL['field']>>(
    identifier: string | number
  ): CHILD_CONTROL {
    if (typeof identifier === 'number') {
      return this._controls[identifier] as CHILD_CONTROL;
    }
    return this._controls.find((control) => [control.name, control.key].includes(identifier)) as CHILD_CONTROL;
  }

  public getControlIndex(identifier: string) {
    return this._controls.findIndex((control) => [control.name, control.key].includes(identifier));
  }

  public moveControl(identifier: string, toIndex: number, emit = true) {
    const currentIndex = this.getControlIndex(identifier);
    const [item] = this._controls.splice(currentIndex, 1);
    this._controls.splice(toIndex, 0, item);
    if (emit) this._emitChanges(false);
    this.control.managers.value._syncCurrentValue(true, true);
  }
}

export { ControlsManager };
