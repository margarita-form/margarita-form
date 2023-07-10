import { BehaviorSubject, debounceTime } from 'rxjs';
import _get from 'lodash.get';
import { BaseManager } from './margarita-form-base-manager';
import { MFC } from '../margarita-form-types';
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
    const { storage, syncronization } = this.control.form.extensions;
    const changes = this.changes.pipe(debounceTime(10));

    this.createSubscription(changes, () => {
      const storageKey = this.control[this.control.config.storageKey || 'key'];
      if (this.control.field.storage) storage.saveStorageValue(storageKey, this._value);
      if (this.control.field.syncronize) syncronization.broadcastChange(this.control.key, this._value);
    });

    if (this.control.field.syncronize) {
      try {
        const subscription = syncronization.subscribeToMessages<CONTROL['value']>(
          this.control.key,
          (value) => this.updateValue(value, false, true, false),
          () => this._value
        );

        if (subscription) {
          this.createSubscription(subscription.observable, subscription.handler);
        }
      } catch (error) {
        console.error(`Could not syncronize value!`, { control: this.control, error });
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
    const { storage } = this.control.form.extensions;
    if (!storage.enabled) return undefined;
    const storageKey = this.control[this.control.config.storageKey || 'key'];
    const storageValue = storage.getStorageValue(storageKey);
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
            if (this.control.config.addMetadataToArrays && 'key' in currentValue) {
              const { key, value } = currentValue;
              return { key, value };
            }
            if (this.control.config.detectAndRemoveMetadataForArrays && 'key' in currentValue) {
              const { key, value } = currentValue;
              return { key, value };
            }
          } catch (error) {
            // Do nothing
          }
          return { value: currentValue, key: undefined };
        };

        const resolveValueAndKey = (currentValue: any, control?: MFC | null) => {
          const currentValueExists = valueExists(currentValue);
          if (currentValueExists) return parseValue(currentValue);
          if (control) return { value: control.value, key: undefined };
          return { value: undefined, key: undefined };
        };

        if (isArray) {
          value.forEach((currentValue, index) => {
            const control = this.control.getControl(index);
            const { value: _value, key } = resolveValueAndKey(currentValue, control);

            if (control) {
              if (key) control.updateKey(key);
              if (_value || !patch) return control.setValue(_value, setAsDirty, false);
            } else {
              const addedControl = this.control.managers.controls.addTemplatedControl({
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
