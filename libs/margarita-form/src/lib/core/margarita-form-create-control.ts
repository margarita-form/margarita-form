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

type Parent = MargaritaFormObjectControlTypes<unknown> | null;
type Root = MargaritaFormObjectControlTypes<unknown> | null;
type Validators = MargaritaFormFieldValidators | null;

export const createControlsController = () => {
  return {
    controls: new BehaviorSubject<MargaritaFormControlTypes[]>([]),
    requireUniqueNames: false,
    _parent: null as Parent,
    _root: null as Root,
    _validators: null as Validators,
    set parent(parent: MargaritaFormObjectControlTypes<unknown>) {
      this._parent = parent;
    },
    get parent(): MargaritaFormObjectControlTypes<unknown> {
      if (!this._parent) throw 'Invalid parent!';
      return this._parent;
    },
    set root(root: MargaritaFormObjectControlTypes<unknown>) {
      this._root = root;
    },
    get root(): MargaritaFormObjectControlTypes<unknown> {
      if (!this._root) throw 'Invalid root!';
      return this._root;
    },
    set validators(validators: MargaritaFormFieldValidators) {
      this._validators = validators;
    },
    get validators(): MargaritaFormFieldValidators {
      if (!this._validators) throw 'Invalid validators!';
      return this._validators;
    },
    get length() {
      return this.controlsArray.length;
    },
    get init() {
      return (
        parent: MargaritaFormObjectControlTypes<unknown>,
        root: MargaritaFormObjectControlTypes<unknown>,
        validators: MargaritaFormFieldValidators,
        requireUniqueNames = false
      ) => {
        this.parent = parent;
        this.root = root;
        this.validators = validators;
        this.requireUniqueNames = requireUniqueNames;
      };
    },
    get addControls() {
      return (fields?: MargaritaFormField[]) => {
        if (!fields) throw 'No fields provided!';
        return fields.map((field) => {
          this.addControl(field);
        });
      };
    },
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
    },
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
    },
    get appendControl() {
      return (control: MargaritaFormControlTypes) => {
        if (this.requireUniqueNames) this.removeControl(control.name);
        const items = this.controls.getValue();
        items.push(control);
        this.controls.next(items);
        return control;
      };
    },
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
    },
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
    },
    get getControlIndex() {
      return (identifier: string) => {
        const items = this.controls.getValue();
        return items.findIndex((control) =>
          [control.name, control.key].includes(identifier)
        );
      };
    },
    get controlChanges(): Observable<MargaritaFormControlTypes<unknown>[]> {
      const changes = this.controls.pipe(debounceTime(5));
      return changes;
    },
    get controlsGroup(): MargaritaFormControlsGroup<unknown> {
      const items = this.controls.getValue();
      const entries = items.map((item) => [item.name, item]);
      return Object.fromEntries(entries);
    },
    get controlsArray(): MargaritaFormControlsArray<unknown> {
      const items = this.controls.getValue();
      return items;
    },
  };
};
