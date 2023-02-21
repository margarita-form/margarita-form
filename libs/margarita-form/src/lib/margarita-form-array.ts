import type {
  CommonRecord,
  MargaritaFormControlBase,
  MargaritaFormControls,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFields,
  MargaritaFormStatus,
} from './margarita-form-types';
import { map, Observable, Subscription, shareReplay, switchMap } from 'rxjs';
import { BehaviorSubject, combineLatest } from 'rxjs';
import _get from 'lodash.get';
import { MargaritaFormControl } from './margarita-form-control';
import { MargaritaFormGroup } from './margarita-form-group';
import { defaultStatus } from './margarita-form-defaults';

type MargaritaFormArrayControls = MargaritaFormControls<unknown>[];

export class MargaritaFormArray<T = CommonRecord[]>
  implements MargaritaFormControlBase<T>
{
  private _controlsArray = new BehaviorSubject<MargaritaFormArrayControls>([]);
  private _status = new BehaviorSubject<MargaritaFormStatus>(defaultStatus);
  private _subscriptions: Subscription[];

  public ref: HTMLElement | null = null;

  constructor(
    public field: MargaritaFormField,
    public parent?: MargaritaFormControlTypes<unknown>
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

  private transformFieldsToControlArray(fields?: MargaritaFormFields) {
    if (!fields) return {};
    const controls = fields.reduce((acc, field) => {
      const { name } = field;
      const control = this.fieldToControl(field);
      acc[name] = control;
      field.control = acc[name];
      return acc;
    }, {} as MargaritaFormControls<unknown>);
    return controls;
  }

  private fieldToControl(
    field: MargaritaFormField
  ): MargaritaFormControlTypes<unknown> {
    const { fields, repeatable } = field;
    if (fields && repeatable) return new MargaritaFormArray(field, this);
    else if (fields) return new MargaritaFormGroup(field, this);
    return new MargaritaFormControl(field, this);
  }

  public register(field: MargaritaFormField, index?: number) {
    const controlsArray = this.controlsArray;
    if (index !== undefined && typeof index === 'number') {
      const controls = controlsArray[index];
      const newControls = this.transformFieldsToControlArray([field]);
      Object.entries(newControls).forEach(([key, control]) => {
        controls[key] = control;
      });
      const { name } = field;
      const control = this.fieldToControl(field);
      controls[name] = control;
    }
  }

  public setValue(values: T[] = []) {
    if (!this.controlsArray) throw 'Cannot set value';

    const controlsArray = this.controlsArray.filter(
      (controls, index) => controls && values?.[index]
    );

    this._controlsArray.next(controlsArray);

    values.map((value, index) => {
      let controls = this.controlsArray[index];
      if (!controls) {
        controls = this.transformFieldsToControlArray(this.field.fields);
        this.controlsArray.push(controls);
      }
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

  public get value(): T {
    return this.controlsArray.map((controls) => {
      return Object.entries(controls).reduce((acc, [key, control]) => {
        acc[key] = control.value;
        return acc;
      }, {} as CommonRecord);
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
    return this.controlsArray[index][name] as T;
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

        const valueChangesEntriesArray = controlsArray.map((controls) => {
          const valueChangesEntries = Object.entries(controls).map(
            ([key, control]) => {
              return control.valueChanges.pipe(
                map((value) => {
                  return { key, value };
                })
              );
            }
          );

          return combineLatest(valueChangesEntries).pipe(
            map((values) => {
              return values.reduce((acc: CommonRecord, { key, value }) => {
                acc[key] = value;
                return acc;
              }, {});
            }),
            shareReplay(1)
          );
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
}
