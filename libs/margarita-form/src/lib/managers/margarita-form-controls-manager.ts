import { BehaviorSubject, filter } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFCA, MFCG, MFF, MargaritaFormHandleLocalize } from '../margarita-form-types';
import { nanoid } from 'nanoid';

class ControlsManager<CONTROL extends MFC> extends BaseManager {
  public changes = new BehaviorSubject<MFC[]>([]);
  #buildWith: CONTROL['field'] = null;
  #controls: MFC[] = [];
  #requireUniqueNames: boolean;

  constructor(public control: CONTROL) {
    super();

    this.#requireUniqueNames = this.control.grouping === 'group';

    this.onCleanup = () => {
      this.#controls.forEach((control) => {
        control.cleanup();
      });
    };

    this.onResubscribe = () => {
      this.#controls.forEach((control) => {
        control.resubscribe();
      });
    };

    this.createSubscription(control.fieldManager.changes.pipe(filter((field) => field !== this.#buildWith)), () =>
      this.rebuild(control.fieldManager.shouldResetControl)
    );

    if (this.control.field) {
      this.rebuild();
    }
  }

  public rebuild(resetControls = false) {
    const { grouping, field } = this.control;
    if (!field) throw 'No field provided for control!';
    this.#buildWith = field;
    const { startWith = 1, fields, template } = field;

    if (this.#buildWith && field.fields && this.control.expectGroup) {
      const controlsToRemove = this.#controls.filter((control) => {
        return !field.fields.some((field: MFF) => field.name === control.name);
      });

      controlsToRemove.forEach((control) => {
        control.remove();
      });
    }

    if (this.control.expectArray) {
      const startFrom = this.#controls.length;
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

    this.#emitChanges();
  }

  #emitChanges() {
    this.changes.next(this.#controls);
  }

  get group(): MFCG {
    const entries = this.#controls.map((control) => [control.name, control]);
    const obj = Object.fromEntries(entries);
    return obj;
  }

  get array(): MFCA {
    return this.#controls;
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

    const field = {
      name: nanoid(4),
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

    if (this.control.expectGroup && !resetControl) {
      const existingControl = this.getControl(field.name);
      if (existingControl) {
        existingControl.updateField(field);
        return existingControl as MargaritaFormControl<VALUE, FIELD>;
      }
    }

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

      return this.addControl(localizedField, resetControl, emit);
    }

    const control = new MargaritaFormControl<VALUE, FIELD>(field, {
      parent: this.control,
      root: this.control.root,
      form: this.control.form,
    });

    if (this.control.state?.disabled) control.disable();
    return this.appendControl(control, resetControl, emit);
  }

  public appendControl<CHILD_CONTROL extends MFC>(control: CHILD_CONTROL, resetControl = false, emit = true): CHILD_CONTROL {
    if (this.#requireUniqueNames) {
      const prevControl = this.getControl<CHILD_CONTROL>(control.name);
      if (resetControl) {
        this.removeControl(control.name);
      } else if (prevControl) {
        prevControl.fieldManager.setField(control.field);
        if (emit) this.#emitChanges();
        return prevControl;
      }
    }

    this.#controls.push(control);
    if (emit) this.#emitChanges();
    return control;
  }

  public removeControl(identifier: string | number, emit = true) {
    if (typeof identifier === 'number') {
      this.#controls.splice(identifier, 1);
    } else {
      const index = this.#controls.findIndex((control) => [control.name, control.key].includes(identifier));
      if (index > -1) {
        const [control] = this.#controls.splice(index, 1);
        control.cleanup();
      }
    }
    if (emit) this.#emitChanges();
  }

  public getControl<CHILD_CONTROL extends MFC = MargaritaFormControl<unknown, CONTROL['field']>>(
    identifier: string | number
  ): CHILD_CONTROL {
    if (typeof identifier === 'number') {
      return this.#controls[identifier] as CHILD_CONTROL;
    }
    return this.#controls.find((control) => [control.name, control.key].includes(identifier)) as CHILD_CONTROL;
  }

  public getControlIndex(identifier: string) {
    return this.#controls.findIndex((control) => [control.name, control.key].includes(identifier));
  }

  public moveControl(identifier: string, toIndex: number, emit = true) {
    const currentIndex = this.getControlIndex(identifier);
    const [item] = this.#controls.splice(currentIndex, 1);
    this.#controls.splice(toIndex, 0, item);
    if (emit) this.#emitChanges();
  }
}

Object.assign(ControlsManager.prototype, Array.prototype);

export { ControlsManager };
