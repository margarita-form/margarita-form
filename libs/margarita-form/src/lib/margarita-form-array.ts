import {
  CommonRecord,
  MargaritaFormBaseElement,
  MargaritaFormControlBase,
  MargaritaFormControlTypes,
  MargaritaFormField,
  MargaritaFormFieldValidationsState,
  MargaritaFormFieldValidators,
  MargaritaFormObjectControlTypes,
  MargaritaFormStateChildren,
  MargaritaFormStateErrors,
} from './margarita-form-types';
import {
  Observable,
  Subscription,
  shareReplay,
  switchMap,
  debounceTime,
} from 'rxjs';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { MargaritaFormGroup } from './margarita-form-group';
import { _createValidationsState } from './core/margarita-form-validation';
import { MargaritaFormBase } from './core/margarita-form-base-class';
import { createControlsController } from './core/margarita-form-create-control';
import { addRef } from './core/margarita-form-add-ref';

export class MargaritaFormArray<T = CommonRecord[]>
  extends MargaritaFormBase
  implements MargaritaFormControlBase<T>
{
  public controlsController = createControlsController();
  private _subscriptions: Subscription[];
  private _validationsState =
    new BehaviorSubject<MargaritaFormFieldValidationsState>({});

  constructor(
    public field: MargaritaFormField,
    private _parent?: MargaritaFormObjectControlTypes<unknown> | null,
    private _root?: MargaritaFormObjectControlTypes<unknown> | null,
    private _validators?: MargaritaFormFieldValidators
  ) {
    super();

    this.controlsController.init(this, this.__root, this.validators);
    this.controlsController.addControls(field.fields);

    if (field.initialValue) this.setValue(field.initialValue as T[]);
    const validationsStateSubscription = this._setValidationsState();
    const stateSubscription = this._setState();
    this._subscriptions = [validationsStateSubscription, stateSubscription];
  }

  public cleanup() {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.controlsController.controlsArray.forEach((control) => {
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

  public addControl(field: MargaritaFormField) {
    this.controlsController.addControl(field);
  }

  public removeControl(identifier: string | number) {
    this.controlsController.removeControl(identifier);
  }

  public remove() {
    this.parent.removeControl(this.key);
  }

  public setValue(values: T[] = []) {
    if (!this.controls) throw 'Cannot set value';

    this.controls.forEach((control, index) => {
      const hasValue = control && values?.[index];
      if (!hasValue) control.remove();
    });

    values.map((value, index) => {
      let controlsItem = this.controls[index];
      if (!controlsItem) {
        if (this.field.grouping === 'repeat-group') {
          controlsItem = this.controlsController.appendRepeatingControlGroup(
            this.field.fields
          );
        }
      }
      if (controlsItem instanceof MargaritaFormGroup) {
        controlsItem.setValue(value);
      }
    });
  }

  public get controls() {
    return this.controlsController.controlsArray;
  }

  public findIndexForName(name: string) {
    if (!name) return -1;
    const index = this.controls.findIndex((group) => group.name === name);
    return index;
  }

  public get value(): T {
    return this.controls.map((controls) => {
      return controls.value;
    }) as T;
  }

  public getControls<T = MargaritaFormControlTypes[]>(index: number) {
    return this.controls[index] as T;
  }

  public getControl<T = MargaritaFormControlTypes>(
    index: number,
    name?: string
  ) {
    const item = this.controls[index];
    if (!name) return item;
    if (item instanceof MargaritaFormGroup) {
      return item.getControl(name) as T;
    }
    throw 'Not yet implemented';
  }

  public addControls(fields = this.field.fields) {
    if (this.field.grouping === 'repeat-group') {
      this.controlsController.appendRepeatingControlGroup(fields);
    }
    if (this.field.grouping === 'array') {
      this.controlsController.addControls(fields);
    }
  }

  public get valueChanges(): Observable<T> {
    return this.controlsController.controlChanges.pipe(
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

  // Common

  get setRef() {
    return (ref: unknown) => {
      return addRef(ref as MargaritaFormBaseElement, this);
    };
  }

  // Internal

  private _setValidationsState(): Subscription {
    return _createValidationsState(this).subscribe((validationState) => {
      this._validationsState.next(validationState);
    });
  }

  private _getChildStates() {
    return this.controls.map((control) => control.stateChanges);
  }

  private _setState() {
    const childStates = combineLatest(this._getChildStates());

    return combineLatest([this._validationsState, childStates])
      .pipe(debounceTime(5))
      .subscribe(([validationStates, childStates]) => {
        const currentIsValid = Object.values(validationStates).every(
          (state) => state.valid
        );
        const childrenAreValid = childStates.every((child) => child.valid);

        const errors = Object.entries(validationStates).reduce(
          (acc, [key, { error }]) => {
            if (error) acc[key] = error;
            return acc;
          },
          {} as MargaritaFormStateErrors
        );

        const children = childStates.reduce((acc, child) => {
          if (!child.control) return acc;
          const { name } = child.control;
          return {
            ...acc,
            [name]: child,
          };
        }, {} as MargaritaFormStateChildren);

        const valid = currentIsValid && childrenAreValid;
        const changes = {
          valid,
          errors,
          children,
        };
        this.updateState(changes);
      });
  }
}
