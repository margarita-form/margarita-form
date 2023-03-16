/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from 'nanoid';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { MargaritaFormGroup } from '../margarita-form-control-group';
import {
  MargaritaForm,
  MargaritaFormControlsArray,
  MargaritaFormControlsGroup,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
} from '../margarita-form-types';

export const createControlFromField = (
  field: MargaritaFormField,
  parent: MargaritaFormObjectControlTypes,
  root: MargaritaForm,
  validators: MargaritaFormFieldValidators
): MargaritaFormControlTypes => {
  const { fields, template } = field;
  const isGroup = fields || template;
  if (isGroup) return new MargaritaFormGroup(field, parent, root, validators);
  return new MargaritaFormControl(field, parent, root, validators);
};

export class ControlsController {
  private controls = new BehaviorSubject<MargaritaFormControlTypes[]>([]);

  constructor(private _parent: MargaritaFormObjectControlTypes<unknown>) {
    this.init();
  }

  private init() {
    const { grouping } = this.parent;
    const { startWith = 1, fields, template } = this.parent.field;
    for (let i = 0; i < startWith; i++) {
      if (grouping === 'repeat-group') {
        const _template = fields ? { fields } : template;
        this.addTemplatedControl(_template);
      } else if (grouping === 'array') {
        if (fields) {
          this.addControls(fields);
        } else {
          this.addTemplatedControl(template);
        }
      } else {
        this.addControls(fields);
      }
    }
  }
  private get _requireUniqueNames() {
    return this._parent.grouping === 'group';
  }
  get parent(): MargaritaFormObjectControlTypes<unknown> {
    if (!this._parent) throw 'Invalid parent!';
    return this._parent;
  }
  get root(): MargaritaForm {
    if (!this._parent.root) throw 'Invalid root!';
    return this._parent.root;
  }
  get validators(): MargaritaFormFieldValidators {
    if (!this._parent.validators) throw 'Invalid validators!';
    return this._parent.validators;
  }
  get length() {
    return this.controlsArray.length;
  }
  get addControls() {
    return (fields?: MargaritaFormField[]) => {
      if (!fields) throw 'No fields provided!';
      return fields.map((field) => {
        this.addControl(field);
      });
    };
  }
  get addTemplatedControl() {
    return (fieldTemplate?: Partial<MargaritaFormField>) => {
      if (!fieldTemplate) throw 'No template for repeating field provided!';
      const field = {
        name: nanoid(4),
        ...fieldTemplate,
      };
      return this.addControl(field);
    };
  }
  get addControl() {
    return (field?: MargaritaFormField) => {
      if (!field) throw 'No field provided!';
      const control = createControlFromField(
        field,
        this.parent,
        this.root,
        this.validators
      );
      if (this.parent.state.disabled) control.disable();
      return this.appendControl(control);
    };
  }
  get appendControl() {
    return (control: MargaritaFormControlTypes) => {
      if (this._requireUniqueNames) this.removeControl(control.name);
      const items = this.controls.getValue();
      items.push(control);
      this.controls.next(items);
      return control;
    };
  }
  get removeControl() {
    return (identifier: string | number) => {
      const items = this.controls.getValue();
      if (typeof identifier === 'number') {
        items.splice(identifier, 1);
      } else {
        const index = items.findIndex((control) =>
          [control.name, control.key].includes(identifier)
        );
        if (index > -1) {
          items.splice(index, 1);
        }
      }
      this.controls.next(items);
    };
  }
  get getControl() {
    return (identifier: string | number) => {
      const items = this.controls.getValue();
      if (typeof identifier === 'number') {
        return items[identifier];
      }
      return items.find((control) =>
        [control.name, control.key].includes(identifier)
      );
    };
  }
  get getControlIndex() {
    return (identifier: string) => {
      const items = this.controls.getValue();
      return items.findIndex((control) =>
        [control.name, control.key].includes(identifier)
      );
    };
  }
  get moveControl() {
    return (identifier: string, toIndex: number) => {
      const items = this.controls.getValue();
      const currentIndex = this.getControlIndex(identifier);
      const [item] = items.splice(currentIndex, 1);
      items.splice(toIndex, 0, item);
      this.controls.next(items);
    };
  }
  get controlChanges(): Observable<MargaritaFormControlTypes<unknown>[]> {
    const changes = this.controls.pipe(debounceTime(5));
    return changes;
  }
  get controlsGroup(): MargaritaFormControlsGroup<unknown> {
    const items = this.controls.getValue();
    const entries = items.map((item) => [item.name, item]);
    const obj = Object.fromEntries(entries);
    return obj;
  }
  get controlsArray(): MargaritaFormControlsArray<unknown> {
    const items = this.controls.getValue();
    return items;
  }
}
