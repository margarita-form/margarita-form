import { BehaviorSubject, filter } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MFCA, MFCG, MFF } from '../margarita-form-types';
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

    const fieldChangesSubscription = control.fieldManager.changes
      .pipe(filter((field) => field !== this.#buildWith))
      .subscribe(() => this.rebuild(control.fieldManager.shouldReplaceControl));

    this.subscriptions.push(fieldChangesSubscription);

    if (this.control.field) {
      this.rebuild();
    }
  }

  public rebuild(replace = false) {
    const { grouping, field } = this.control;

    if (!field) throw 'No field provided for control!';
    this.#buildWith = field;

    const { startWith = 1, fields, template } = field;
    for (let i = 0; i < startWith; i++) {
      if (grouping === 'repeat-group') {
        const _template = fields ? { fields } : template;
        this.addTemplatedControl(_template, replace);
      } else if (grouping === 'array') {
        if (fields) {
          this.addControls(fields, replace);
        } else {
          this.addTemplatedControl(template, replace);
        }
      } else if (fields) {
        this.addControls(fields, replace);
      }
    }
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
    replace = false
  ): MargaritaFormControl<VALUE, FIELD>[] {
    if (!fields) throw 'No fields provided!';
    return fields.map((field) => {
      return this.addControl(field, replace);
    });
  }

  public addTemplatedControl<CHILD_FIELD extends MFF = CONTROL['field']>(
    fieldTemplate?: Partial<CHILD_FIELD>,
    replace = false
  ): MargaritaFormControl<unknown, CHILD_FIELD> {
    if (!fieldTemplate) throw 'No template for repeating field provided!';

    const field = {
      name: nanoid(4),
      ...fieldTemplate,
    } as CHILD_FIELD;

    return this.addControl<CHILD_FIELD>(field, replace);
  }

  public addControl<FIELD extends MFF = CONTROL['field'], VALUE = unknown>(
    field: FIELD,
    replace = false
  ): MargaritaFormControl<VALUE, FIELD> {
    if (!field) throw 'No field provided!';

    const control = new MargaritaFormControl<VALUE, FIELD>(field, {
      parent: this.control,
      root: this.control.root,
      form: this.control.form,
    });

    if (this.control.state?.disabled) control.disable();
    return this.appendControl(control, replace);
  }

  public appendControl<CHILD_CONTROL extends MFC>(
    control: CHILD_CONTROL,
    replace = false
  ): CHILD_CONTROL {
    if (this.#requireUniqueNames) {
      const prevControl = this.getControl<CHILD_CONTROL>(control.name);
      if (replace) {
        this.removeControl(control.name);
      } else if (prevControl) {
        prevControl.fieldManager.setField(control.field);
        this.#emitChanges();
        return prevControl;
      }
    }

    this.#controls.push(control);
    this.#emitChanges();
    return control;
  }
  public removeControl(identifier: string | number) {
    if (typeof identifier === 'number') {
      this.#controls.splice(identifier, 1);
    } else {
      const index = this.#controls.findIndex((control) =>
        [control.name, control.key].includes(identifier)
      );
      if (index > -1) {
        const [control] = this.#controls.splice(index, 1);
        control.cleanup();
      }
    }
    this.#emitChanges();
  }

  public getControl<
    CHILD_CONTROL extends MFC = MargaritaFormControl<unknown, CONTROL['field']>
  >(identifier: string | number): CHILD_CONTROL {
    if (typeof identifier === 'number') {
      return this.#controls[identifier] as CHILD_CONTROL;
    }
    return this.#controls.find((control) =>
      [control.name, control.key].includes(identifier)
    ) as CHILD_CONTROL;
  }

  public getControlIndex(identifier: string) {
    return this.#controls.findIndex((control) =>
      [control.name, control.key].includes(identifier)
    );
  }

  public moveControl(identifier: string, toIndex: number) {
    const currentIndex = this.getControlIndex(identifier);
    const [item] = this.#controls.splice(currentIndex, 1);
    this.#controls.splice(toIndex, 0, item);
    this.#emitChanges();
  }
}

Object.assign(ControlsManager.prototype, Array.prototype);

export { ControlsManager };
