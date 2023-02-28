import {
  arrayGroupings,
  CommonRecord,
  MargaritaFormControlBase,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFields,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStatus,
} from './margarita-form-types';
import { Observable, Subscription, shareReplay, switchMap } from 'rxjs';
import { BehaviorSubject, combineLatest } from 'rxjs';
import _get from 'lodash.get';
import { defaultStatus } from './margarita-form-defaults';
import { nanoid } from 'nanoid';
import { MargaritaFormGroup } from './margarita-form-group';
import { MargaritaFormControl } from './margarita-form-control';
import { _createValidationsState } from './core/margarita-form-validation';

type MargaritaFormArrayControls<T = unknown> = MargaritaFormControlTypes<T>[];

export class MargaritaFormArray<T = CommonRecord[]>
  implements MargaritaFormControlBase<T>
{
  private _controlsArray = new BehaviorSubject<MargaritaFormArrayControls>([]);
  private _status = new BehaviorSubject<MargaritaFormStatus>(defaultStatus);
  private _subscriptions: Subscription[];
  private _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});

  public ref: HTMLElement | null = null;

  constructor(
    public field: MargaritaFormField,
    private _parent?: MargaritaFormObjectControlTypes<unknown> | null,
    private _root?: MargaritaFormObjectControlTypes<unknown> | null,
    private _validators?: MargaritaFormFieldValidators
  ) {
    const controlsArrayItem = this.transformFieldsToControlArray(field.fields);
    this._controlsArray.next(controlsArrayItem);
    if (field.initialValue) this.setValue(field.initialValue as T[]);
    const validationsStateSubscription = this._setValidationsState();
    this._subscriptions = [validationsStateSubscription];
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.controlsArray.forEach((controls) => {
      Object.values(controls).forEach((control) => {
        control.cleanup();
      });
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
    return this.__root;
  }

  private get __root(): MargaritaFormObjectControlTypes<unknown> {
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

  private transformFieldsToControlArray(
    fields?: MargaritaFormFields
  ): MargaritaFormControlTypes[] {
    if (!fields) return [];
    const name = nanoid(4);
    if (this.field.grouping === 'array') {
      return fields.map((field) => {
        const control = this.getControlType(field);
        field.control = control;
        return control;
      });
    }
    const controlsItem = new MargaritaFormGroup(
      { name, fields },
      this,
      this.__root,
      this.validators
    );
    return [controlsItem];
  }

  private getControlType(field: MargaritaFormField): MargaritaFormControlTypes {
    const { fields, grouping = 'group' } = field;
    const isArray = fields && arrayGroupings.includes(grouping);
    if (isArray)
      return new MargaritaFormArray(field, this, this.__root, this.validators);
    if (fields)
      return new MargaritaFormGroup(field, this, this.__root, this.validators);
    return new MargaritaFormControl(field, this, this.__root, this.validators);
  }

  public register(field: MargaritaFormField, index?: number) {
    const controlsArray = this.controlsArray;
    if (this.field.grouping === 'repeat-group') {
      if (index !== undefined && typeof index === 'number') {
        const controls = controlsArray[index] as MargaritaFormGroup;
        controls.register(field);
      }
    }
    if (this.field.grouping === 'repeat-group') {
      throw 'Not yet implemented';
    }
  }

  public unregister(name: string, index?: number) {
    throw 'not yet implemented';
  }

  public remove() {
    if (this.parent instanceof MargaritaFormArray) {
      this.parent.removeControls(this.index);
    }
    if (this.parent instanceof MargaritaFormGroup) {
      this.parent.unregister(this.name);
    }
  }

  public setValue(values: T[] = []) {
    if (!this.controlsArray) throw 'Cannot set value';

    const controlsArray = this.controlsArray.filter(
      (controls, index) => controls && values?.[index]
    );

    this._controlsArray.next(controlsArray);

    values.map((value, index) => {
      let controlsItem = this.controlsArray[index];
      if (!controlsItem) {
        if (this.field.grouping === 'repeat-group') {
          const [group] = this.transformFieldsToControlArray(
            this.field.fields
          ) as [MargaritaFormGroup];
          controlsItem = group;
          this.controlsArray[index] === controlsItem;
        }
      }
      if (controlsItem instanceof MargaritaFormGroup) {
        controlsItem.setValue(value);
      }
    });
  }

  public get controlsArray() {
    return this._controlsArray.value;
  }

  public findIndexForName(name: string) {
    if (!name) return -1;
    const index = this.controlsArray.findIndex((group) => group.name === name);
    return index;
  }

  public get value(): T {
    return this.controlsArray.map((controls) => {
      return controls.value;
    }) as T;
  }

  public get statusChanges(): Observable<MargaritaFormStatus> {
    const observable = this._status.pipe(shareReplay(1));
    return observable;
  }

  public get status(): MargaritaFormStatus {
    return this._status.getValue();
  }

  public getControls<T = MargaritaFormControlTypes[]>(index: number) {
    return this.controlsArray[index] as T;
  }

  public getControl<T = MargaritaFormControlTypes>(
    index: number,
    name?: string
  ) {
    const item = this.controlsArray[index];
    if (!name) return item;
    if (item instanceof MargaritaFormGroup) {
      return item.getControl(name) as T;
    }
    throw 'Not yet implemented';
  }

  public addControls(fields = this.field.fields) {
    const controlsArray = this.controlsArray;
    const controlItems = this.transformFieldsToControlArray(fields);
    if (this.field.grouping === 'repeat-group') {
      controlsArray.push(...controlItems);
    }
    if (this.field.grouping === 'array') {
      throw 'Not yet implemented';
    }
    this._controlsArray.next(controlsArray);
  }

  public removeControls(index: number) {
    const controlsArray = this.controlsArray;
    controlsArray.splice(index, 1);
    this._controlsArray.next(controlsArray);
  }

  public get valueChanges(): Observable<T> {
    return this._controlsArray.pipe(
      switchMap((controlsArray) => {
        if (!controlsArray.length)
          return new Promise((resolve) =>
            resolve(undefined as T)
          ) as Promise<T>;

        const valueChangesEntriesArray = controlsArray.map((group) => {
          return group.valueChanges;
        });

        return combineLatest(valueChangesEntriesArray).pipe(
          shareReplay(1)
        ) as Observable<T>;
      })
    );
  }

  public setRef(node: HTMLElement | null) {
    this.ref = node;
  }

  // Common

  get controls() {
    console.warn(
      'Trying to access "controls" which is not available for MargaritaFormArray!',
      { context: this }
    );
    return null;
  }

  // Internal

  private _setValidationsState(): Subscription {
    return _createValidationsState(this).subscribe((validationState) => {
      this._validationsState.next(validationState);
    });
  }
}
