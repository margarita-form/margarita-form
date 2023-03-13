/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from 'nanoid';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { MargaritaFormGroup } from '../margarita-form-control-group';
import {
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
  root: MargaritaFormObjectControlTypes<unknown>,
  validators: MargaritaFormFieldValidators
): MargaritaFormControlTypes => {
  const { fields } = field;
  if (fields) return new MargaritaFormGroup(field, parent, root, validators);
  return new MargaritaFormControl(field, parent, root, validators);
};

export class ControlsController {
  private controls = new BehaviorSubject<MargaritaFormControlTypes[]>([]);

  constructor(
    private _parent: MargaritaFormObjectControlTypes<unknown>,
    private _root: MargaritaFormObjectControlTypes<unknown>,
    private _validators: MargaritaFormFieldValidators,
    private _requireUniqueNames = false,
    private _initialFields?: MargaritaFormField[]
  ) {
    this.addControls(this._initialFields);
  }

  get parent(): MargaritaFormObjectControlTypes<unknown> {
    if (!this._parent) throw 'Invalid parent!';
    return this._parent;
  }
  get root(): MargaritaFormObjectControlTypes<unknown> {
    if (!this._root) throw 'Invalid root!';
    return this._root;
  }
  get validators(): MargaritaFormFieldValidators {
    if (!this._validators) throw 'Invalid validators!';
    return this._validators;
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
  get appendRepeatingControlGroup() {
    return (fields?: MargaritaFormField[], initialValue?: unknown) => {
      if (!fields) throw 'No fields provided!';
      const field = {
        name: nanoid(4),
        fields,
        initialValue,
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
