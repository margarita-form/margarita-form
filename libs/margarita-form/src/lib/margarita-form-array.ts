import type {
  CommonRecord,
  MargaritaFormControlBase,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFields,
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

type MargaritaFormArrayControls<T = unknown> = MargaritaFormGroup<T>[];

export class MargaritaFormArray<T = CommonRecord[]>
  implements MargaritaFormControlBase<T>
{
  private _controlsArray = new BehaviorSubject<MargaritaFormArrayControls>([]);
  private _status = new BehaviorSubject<MargaritaFormStatus>(defaultStatus);
  private _subscriptions: Subscription[];

  public ref: HTMLElement | null = null;

  constructor(
    public field: MargaritaFormField,
    private _parent?: MargaritaFormObjectControlTypes<unknown> | null,
    private _root?: MargaritaFormObjectControlTypes<unknown> | null,
    private _validators?: MargaritaFormFieldValidators
  ) {
    const first = this.transformFieldsToControlArray(field.fields);
    const controlsArray = [first];
    this._controlsArray.next(controlsArray);
    if (field.initialValue) this.setValue(field.initialValue as T[]);
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
  ): MargaritaFormGroup {
    const name = nanoid(4);
    const controlsItem = new MargaritaFormGroup(
      { name, fields },
      this,
      this.root
    );
    return controlsItem;
  }

  public register(field: MargaritaFormField, index?: number) {
    const controlsArray = this.controlsArray;
    if (index !== undefined && typeof index === 'number') {
      const controls = controlsArray[index];
      controls.register(field);
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
        controlsItem = this.transformFieldsToControlArray(this.field.fields);
        this.controlsArray.push(controlsItem);
      }
      const { controls } = controlsItem;
      Object.values(controls).forEach((control) => {
        const { name } = control.field;
        if (value && typeof value === 'object') {
          const updatedValue = _get(value, [name], control.value);
          control.setValue(updatedValue);
        } else {
          // control.setValue(null);
          throw 'Not yet implemented';
        }
      });
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
    name: string
  ) {
    return this.controlsArray[index].getControl(name) as T;
  }

  public addControls(fields = this.field.fields) {
    const controlsArray = this.controlsArray;
    const controls = this.transformFieldsToControlArray(fields);
    controlsArray.push(controls);
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
}
