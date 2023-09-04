import { BehaviorSubject, debounceTime, skip } from 'rxjs';
import _get from 'lodash.get';
import { BaseManager } from './margarita-form-base-manager';
import { CommonRecord, MFC } from '../margarita-form-types';
import { isObject, valueExists } from '../helpers/check-value';

class ValueManager<CONTROL extends MFC> extends BaseManager {
  private _value: CONTROL['value'] = undefined;
  public changes = new BehaviorSubject<CONTROL['value']>(undefined);

  constructor(public control: CONTROL) {
    super();

    const initialValue = this._getInitialValue();
    if (initialValue) {
      this._value = initialValue;
    }
  }

  public override _init() {
    const { storage, syncronization } = this.control.extensions;
    const changes = this.changes.pipe(debounceTime(500), skip(1));

    this.createSubscription(changes, () => {
      if (this.control.field.useStorage) storage.saveStorageValue(this._value);
      if (this.control.field.useSyncronization) syncronization.broadcastChange(this._value);
    });

    if (this.control.field.useSyncronization) {
      try {
        const subscription = syncronization.subscribeToMessages<CONTROL['value']>(
          (value) => this.updateValue(value, false, true, false),
          () => this._value
        );

        if (subscription && subscription.observable) {
          this.createSubscription(subscription.observable, subscription.handler);
        }
      } catch (error) {
        console.error(`Could not syncronize value!`, { control: this.control, error });
      }
    }

    if (this.control.field.useStorage) {
      try {
        const observable = storage.getStorageValueListener<CONTROL['value']>();

        if (observable) {
          this.createSubscription(observable, (value) => this.updateValue(value, false, true, false));
        }
      } catch (error) {
        console.error(`Could not subscribe to storage changes!`, { control: this.control, error });
      }
    }
  }

  private _emitChanges(update: 'parent' | 'children' | 'none' = 'parent', setAsDirty = true, patch = false) {
    if (update === 'children') {
      this._syncChildValues(setAsDirty, patch);
    }
    if (update === 'parent') {
      this.control.updateSyncId();
      this.changes.next(this._value);
      this._syncParentValue(setAsDirty, true);
    }
    if (update === 'none') {
      this.control.updateSyncId();
      this.changes.next(this._value);
    }
  }

  private _getInitialValue() {
    const storageValue = this._getStorageValue();
    if (storageValue !== undefined) return storageValue;

    const inheritedValue = this._getInheritedValue();
    if (inheritedValue !== undefined) return inheritedValue;

    return this.control.field.initialValue;
  }

  private _getInheritedValue() {
    if (this.control.isRoot) return undefined;

    const { value: parentValue, expectArray } = this.control.parent || {};
    if (typeof parentValue !== 'object') return undefined;

    if (expectArray) {
      const inheritedValue = _get(parentValue, this.control.index, undefined);
      if (inheritedValue !== undefined) {
        return inheritedValue;
      }
    } else if ('key' in parentValue) {
      const inheritedValue = _get(parentValue, ['value', this.control.name], undefined);
      if (inheritedValue !== undefined) {
        return inheritedValue;
      }
    } else {
      const inheritedValue = _get(parentValue, this.control.name, undefined);
      if (inheritedValue !== undefined) {
        return inheritedValue;
      }
    }
  }

  private _getStorageValue() {
    const { storage } = this.control.extensions;
    if (!storage.enabled) return undefined;
    const storageValue = storage.getStorageValue();
    return storageValue;
  }

  /**
   * Get current value of the control
   */
  public get current(): CONTROL['value'] {
    return this._value;
  }

  /**
   * Set value of the control
   * @param value value to set
   * @param setAsDirty update dirty state to true
   */
  public updateValue(value: unknown, setAsDirty = true, emitEvent = true, patch = false) {
    // Todo: implement patch
    this._value = value;
    const isActive = this.control.state.active;
    if (isActive && setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this._emitChanges('children', setAsDirty, patch);
  }

  /**
   * @Internal
   */
  private _resolveValue(): CONTROL['value'] {
    if (this.control.expectChildControls) {
      if (!this.control.hasControls) return undefined;
      if (this.control.expectArray) {
        return this.control.activeControls.map((control) => {
          if (control.config.addMetadataToArrays) {
            if (control.config.addMetadataToArrays === 'flat') {
              const isGroup = control.expectGroup;
              if (!isGroup)
                throw 'To add metadata to array where child is not an object, change "addMetadataToArrays" to true instead of "flat"!';
              const value = control.value as CommonRecord;
              if (!value) return undefined;
              if ('name' in value) throw 'Cannot add flat metadata to array where child has "name" property!';
              if ('key' in value) throw 'Cannot add flat metadata to array where child has "key" property!';
              return {
                ...value,
                key: control.key,
                name: control.name,
              };
            }
            return {
              value: control.value,
              key: control.key,
              name: control.name,
            };
          }
          return control.value;
        });
      }

      const entries = this.control.activeControls.reduce((acc, control) => {
        const exists = valueExists(control.value);
        if (!exists) acc.push([control.name, undefined]);
        else if (control.value && control.expectFlat && typeof control.value === 'object') {
          const childEntries = Object.entries(control.value);
          acc.push(...childEntries);
        } else {
          acc.push([control.name, control.value]);
        }
        return acc;
      }, [] as [string, unknown][]);

      return Object.fromEntries(entries);
    }
    return this._value;
  }

  /**
   * @Internal
   */
  public _syncParentValue(setAsDirty = true, emitEvent = true) {
    if (!this.control.isRoot) {
      this.control.parent.managers.value._syncCurrentValue(setAsDirty, emitEvent);
    }
  }

  /**
   * @Internal
   */
  public _syncChildValues(setAsDirty = true, patch = false) {
    const value: unknown = this._value;
    const validValue = isObject(this._value);
    if (validValue && this.control.expectChildControls) {
      if (this.control.expectArray) {
        const isArray = Array.isArray(value);

        const parseValue = (currentValue: any) => {
          try {
            if (this.control.config.addMetadataToArrays === 'flat') {
              const { key, name, ...rest } = currentValue;
              return { key, name, value: rest };
            }

            if (this.control.config.addMetadataToArrays || this.control.config.detectAndRemoveMetadataForArrays) {
              const { key, name, ...rest } = currentValue;
              if ('value' in rest) return { key, name, value: rest.value };
              if (Object.keys(rest).length > 0) return { key, name, value: rest };
              return { key, name, value: undefined };
            }
          } catch (error) {
            // Do nothing
          }

          return { value: currentValue, key: undefined };
        };

        const resolveValueAndKey = (currentValue: any, control?: MFC | null) => {
          const currentValueExists = valueExists(currentValue);
          if (currentValueExists) return parseValue(currentValue);
          if (control) return { value: control.value, key: undefined, name: undefined };
          return { value: undefined, key: undefined, name: undefined };
        };

        if (isArray) {
          value.forEach((currentValue, index) => {
            const control = this.control.getControl(index);
            const { value: _value, key, name } = resolveValueAndKey(currentValue, control);
            if (control) {
              if (key) control.updateKey(key);
              if (_value || !patch) return control.setValue(_value, setAsDirty, false);
            } else {
              const addedControl = this.control.managers.controls.appendRepeatingControl(name, {
                initialValue: _value,
              });
              if (key) addedControl.updateKey(key);
            }
          });
        }

        const controls = [...this.control.controls]; // Copy array to avoid problems caused by mutation of original array

        controls.forEach((control, index) => {
          control.managers.value._syncCurrentValue(false, false, 'children');
          const hasValue = isArray && value[index];
          if (!hasValue && !patch) {
            control.remove();
          } else {
            const currentValue: any = isArray ? value[index] : value;
            const { value: _value, key } = resolveValueAndKey(currentValue, control);
            if (key) control.updateKey(key);
            if (_value || !patch) control.setValue(_value, setAsDirty, false);
          }
        });
      } else {
        this._updateChildGroupValues(value, setAsDirty, patch);
      }
      this._syncCurrentValue(setAsDirty, true);
    } else if (this.control.hasControls) {
      this.control.controls.forEach((control) => {
        control.managers.value._emitChanges('children', setAsDirty);
      });
    } else {
      this._emitChanges('parent', setAsDirty);
    }
  }

  public _updateChildGroupValues(parentValue: unknown, setAsDirty = true, patch = false) {
    this.control.controls.forEach((control) => {
      if (control.expectFlat) {
        control.managers.value._updateChildGroupValues(parentValue, setAsDirty, patch);
      } else {
        const updatedValue = _get(parentValue, [control.name], patch ? control.value : undefined);
        control.setValue(updatedValue, setAsDirty);
      }
    });
  }

  /**
   * @Internal
   */
  public _syncCurrentValue(setAsDirty = true, emitEvent = true, update: 'parent' | 'children' | 'none' = 'parent') {
    const value = this._resolveValue();
    this._value = value;
    if (setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this._emitChanges(update, setAsDirty);
    else if (update === 'parent') this._syncParentValue(setAsDirty, emitEvent);
    else if (update === 'children') this._syncChildValues(setAsDirty, emitEvent);
  }
}

export { ValueManager };
