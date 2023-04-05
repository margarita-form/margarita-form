/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from 'nanoid';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { MargaritaFormValueControl } from '../margarita-form-value-control';
import { MargaritaFormGroupControl } from '../margarita-form-group-control';
import {
  MargaritaForm,
  MargaritaFormControlsArray,
  MargaritaFormControlsGroup,
  MargaritaFormControl,
  MargaritaFormField,
  MargaritaFormFieldValidators,
} from '../margarita-form-types';

type CreateFn = <F extends MargaritaFormField>(
  field: F,
  parent: MargaritaFormGroupControl<unknown, F>,
  root: MargaritaForm,
  validators?: MargaritaFormFieldValidators
) => MargaritaFormControl<unknown, F>;

export const createControlFromField: CreateFn = <
  F extends MargaritaFormField = MargaritaFormField
>(
  field: F,
  parent: MargaritaFormGroupControl<unknown, F>,
  root: MargaritaForm,
  validators?: MargaritaFormFieldValidators
): MargaritaFormControl<unknown, F> => {
  const { fields, template } = field;
  const isGroup = fields || template;
  if (isGroup)
    return new MargaritaFormGroupControl<unknown, F>(
      field,
      parent,
      root,
      validators
    );
  return new MargaritaFormValueControl(field, parent, root, validators);
};

export class ControlsController<
  F extends MargaritaFormField = MargaritaFormField
> {
  private controls = new BehaviorSubject<MargaritaFormControl<unknown, F>[]>(
    []
  );

  constructor(private _parent: MargaritaFormGroupControl<unknown, F>) {}

  /**
   * @internal
   */
  public _addInitialControls() {
    const { grouping } = this.parent;
    const { startWith = 1, fields, template } = this.parent.field;
    for (let i = 0; i < startWith; i++) {
      if (grouping === 'repeat-group') {
        const _template = fields ? { fields } : template;
        this.addTemplatedControl(_template);
      } else if (grouping === 'array') {
        if (fields) {
          this.addControls(fields as F[]);
        } else {
          this.addTemplatedControl(template);
        }
      } else {
        this.addControls(fields as F[]);
      }
    }
  }
  private get _requireUniqueNames() {
    return this._parent.grouping === 'group';
  }
  get parent(): MargaritaFormGroupControl<unknown, F> {
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
  get length(): number {
    return this.controlsArray.length;
  }
  get addControls() {
    return (fields?: F[]): MargaritaFormControl<unknown, F>[] => {
      if (!fields) throw 'No fields provided!';
      return fields.map((field) => {
        return this.addControl(field);
      });
    };
  }
  get addTemplatedControl() {
    return (
      fieldTemplate?: Partial<MargaritaFormField>
    ): MargaritaFormControl<unknown, F> => {
      if (!fieldTemplate) throw 'No template for repeating field provided!';
      const field = {
        name: nanoid(4),
        ...fieldTemplate,
      } as F;
      return this.addControl(field);
    };
  }
  get addControl() {
    return (field?: F): MargaritaFormControl<unknown, F> => {
      if (!field) throw 'No field provided!';
      const validators = field.validators;
      const control = createControlFromField<F>(
        field,
        this.parent,
        this.root,
        validators
      );
      if (this.parent.state.disabled) control.disable();
      return this.appendControl(control);
    };
  }
  get appendControl() {
    return (
      control: MargaritaFormControl<unknown, F>
    ): MargaritaFormControl<unknown, F> => {
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
    return (identifier: string | number): MargaritaFormControl<unknown, F> => {
      const items = this.controls.getValue();
      if (typeof identifier === 'number') {
        return items[identifier];
      }
      return items.find((control) =>
        [control.name, control.key].includes(identifier)
      ) as MargaritaFormControl<unknown, F>;
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
  get controlChanges(): Observable<MargaritaFormControl<unknown, F>[]> {
    const changes = this.controls.pipe(debounceTime(5));
    return changes;
  }
  get controlsGroup(): MargaritaFormControlsGroup<unknown, F> {
    const items = this.controls.getValue();
    const entries = items.map((item) => [item.name, item]);
    const obj = Object.fromEntries(entries);
    return obj;
  }
  get controlsArray(): MargaritaFormControlsArray<unknown, F> {
    const items = this.controls.getValue();
    return items;
  }
}
