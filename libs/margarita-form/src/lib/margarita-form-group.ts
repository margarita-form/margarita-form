import {
  arrayGroupings,
  CommonRecord,
  MargaritaFormControlBase,
  MargaritaFormControls,
  MargaritaFormField,
  MargaritaFormFields,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStatus,
} from './margarita-form-types';
import type { Observable, Subscription } from 'rxjs';
import {
  BehaviorSubject,
  shareReplay,
  switchMap,
  map,
  combineLatest,
} from 'rxjs';
import _get from 'lodash.get';
import { MargaritaFormControl } from './margarita-form-control';
import { MargaritaFormArray } from './margarita-form-array';
import { defaultStatus } from './margarita-form-defaults';

export class MargaritaFormGroup<T = CommonRecord>
  implements MargaritaFormControlBase<T>
{
  private _controls = new BehaviorSubject<MargaritaFormControls<unknown>>({});
  private _status = new BehaviorSubject<MargaritaFormStatus>(defaultStatus);
  private _subscriptions: Subscription[];

  public ref: HTMLElement | null = null;

  constructor(
    public field: MargaritaFormField,
    private _parent?: MargaritaFormObjectControlTypes<unknown> | null,
    private _root?: MargaritaFormObjectControlTypes<unknown> | null,
    private _validators?: MargaritaFormFieldValidators
  ) {
    const controls = this.transformFieldsToControls(field.fields);
    this._controls.next(controls);
    if (field.initialValue) this.setValue(field.initialValue);
    const valueChangesSubscription = this.valueChanges.subscribe((value) => {
      /*
      console.log({
        field,
        control: this,
        value,
      });
      */
    });
    this._subscriptions = [valueChangesSubscription];
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    Object.values(this.controls).forEach((control) => {
      control.cleanup();
    });
  }

  public get name(): string {
    return this.field.name;
  }

  public get parent(): MargaritaFormObjectControlTypes<unknown> {
    if (!this._parent) {
      console.warn('Root of controls reached!', this);
    }
    return this._parent || this;
  }

  public get root(): MargaritaFormObjectControlTypes<unknown> {
    if (!this._root) {
      console.warn('Root of controls already reached!', this);
    }
    return this._root || this;
  }

  public get validators(): MargaritaFormFieldValidators {
    return this._validators || this.root.validators;
  }

  public get index(): number {
    if (this.parent instanceof MargaritaFormArray) {
      return this.parent.findIndexForName(this.name);
    }
    return -1;
  }

  private transformFieldsToControls(fields?: MargaritaFormFields) {
    if (!fields) return {};
    const controls = fields.reduce((acc, field) => {
      const { name, fields, grouping = 'group' } = field;
      const isArray = fields && arrayGroupings.includes(grouping);
      if (isArray) acc[name] = new MargaritaFormArray(field, this, this.root);
      else if (fields)
        acc[name] = new MargaritaFormGroup(field, this, this.root);
      else acc[name] = new MargaritaFormControl(field, this, this.root);
      field.control = acc[name];
      return acc;
    }, {} as MargaritaFormControls<unknown>);
    return controls;
  }

  public register(field: MargaritaFormField) {
    if (!this.field.fields) throw 'Could not register new field';
    this.field.fields.push(field);
    const { name, fields, grouping = 'group' } = field;
    const isArray = fields && arrayGroupings.includes(grouping);
    const controls = this.controls;
    if (isArray)
      controls[name] = new MargaritaFormArray(field, this, this.root);
    else if (fields)
      controls[name] = new MargaritaFormGroup(field, this, this.root);
    else controls[name] = new MargaritaFormControl(field, this, this.root);
    this._controls.next(controls);
  }

  public unregister(name: string) {
    const control = this.getControl(name);
    if (control) {
      control.cleanup();
      delete this.controls[name];
      this._controls.next(this.controls);
    } else {
      console.warn(`Could not find control named "${name}"!`, {
        controls: this.controls,
      });
    }
  }

  public remove() {
    if (this.parent instanceof MargaritaFormArray) {
      this.parent.removeControls(this.index);
    }
    if (this.parent instanceof MargaritaFormGroup) {
      this.parent.unregister(this.name);
    }
  }

  public setValue(value: unknown) {
    if (!this.controls) throw 'Cannot set value';
    Object.values(this.controls).forEach((control) => {
      const { name } = control.field;
      if (value && typeof value === 'object') {
        const updatedValue = _get(value, [name], control.value);
        control.setValue(updatedValue);
      } else {
        // control.setValue(null);
        throw 'Not yet implemented';
      }
    });
  }

  public get controls(): MargaritaFormControls<unknown> {
    return this._controls.value;
  }

  public getControl<T = MargaritaFormGroup | MargaritaFormControl>(
    name: string
  ) {
    return this.controls[name] as T;
  }

  public get statusChanges(): Observable<MargaritaFormStatus> {
    const observable = this._status.pipe(shareReplay(1));
    return observable;
  }

  public get status(): MargaritaFormStatus {
    return this._status.getValue();
  }

  public get value(): T {
    return Object.entries(this.controls).reduce(
      (acc: CommonRecord, [key, control]) => {
        acc[key] = control.value;
        return acc;
      },
      {}
    ) as T;
  }

  public get valueChanges(): Observable<T> {
    return this._controls.pipe(
      switchMap((controls) => {
        const valueChangesEntries = Object.entries(controls).map(
          ([key, control]) => {
            return control.valueChanges.pipe(
              map((value) => {
                return { key, value };
              })
            );
          }
        );

        const valueChanges = combineLatest(valueChangesEntries).pipe(
          map((values) => {
            return values.reduce((acc: CommonRecord, { key, value }) => {
              acc[key] = value;
              return acc;
            }, {});
          }),
          shareReplay(1)
        );

        return valueChanges as Observable<T>;
      })
    );
  }

  public setRef(node: HTMLElement | null) {
    this.ref = node;
  }

  // Common
  get controlsArray() {
    console.warn(
      'Trying to access "controlsArray" which is not available for MargaritaFormGroup!',
      { context: this }
    );
    return null;
  }
}
