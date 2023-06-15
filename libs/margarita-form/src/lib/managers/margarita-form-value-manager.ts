import { BehaviorSubject, debounceTime, fromEvent } from 'rxjs';
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
    /*
    REFACTOR ME

    this.createSubscription(this.control.managers.controls.changes, () => {
      // this._syncCurrentValue(false);
    });
    */

    /*
    REFACTOR ME

    this.createSubscription(this.control.managers.field.changes, () => {
      if (this.control.managers.field.shouldResetControl) {
        const initialValue = this._getInitialValue();
        if (initialValue) {
          this.updateValue(initialValue, false, false, false);
        }
      }
    });
    */

    if (this.control.isRoot) {
      if (this.control.config.useStorage) {
        this.createSubscription(this.changes.pipe(debounceTime(10)), () => {
          this._saveStorageValue();
        });
      }
      if (this.control.config.useSyncronization) {
        try {
          const cache = { value: null };
          const broadcaster = new BroadcastChannel(this.control.name);
          broadcaster.postMessage({ key: this.control.key, requestSend: true });

          this.createSubscription(this.changes.pipe(debounceTime(10)), (value) => {
            const valueChanged = JSON.stringify(value) !== JSON.stringify(cache.value);
            if (valueChanged) {
              broadcaster.postMessage({ key: this.control.key, value });
            }
          });

          this.createSubscription(fromEvent<MessageEvent>(broadcaster, 'message'), (event) => {
            if (event.data.requestSend) {
              broadcaster.postMessage({ key: this.control.key, value: this._value });
            } else if (event.data.key !== this.control.key) {
              const valueChanged = JSON.stringify(event.data.value) !== JSON.stringify(this._value);
              if (valueChanged) {
                this.updateValue(event.data.value, false, false, false);
                cache.value = event.data.value;
              }
            }
          });
        } catch (error) {
          console.error(`Could not syncronize value!`, { control: this.control, error });
        }
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

  private _getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    if (this.control.isRoot && this.control.config.useStorage) {
      const { useStorage } = this.control.config;
      if (useStorage === 'localStorage') {
        return localStorage;
      }
      if (useStorage === 'sessionStorage') {
        return sessionStorage;
      }
    }
    return null;
  }

  private _getInitialValue() {
    const storage = this._getStorage();
    if (storage) {
      try {
        const sessionStorageValue = storage.getItem(this.control.name);
        if (sessionStorageValue) return JSON.parse(sessionStorageValue);
      } catch (error) {
        console.error(`Could not get value from ${this.control.config.useStorage}!`, { control: this.control, error });
      }
    }

    if (!this.control.isRoot) {
      const parentValue = this.control.parent.value || {};
      if (this.control.parent.expectArray) {
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

    return this.control.field.initialValue;
  }

  private _saveStorageValue() {
    const storage = this._getStorage();
    if (storage) {
      try {
        const stringified = JSON.stringify(this._value);
        if (stringified === '{}') {
          this.clearStorageValue();
        } else {
          storage.setItem(this.control.name, stringified);
        }
      } catch (error) {
        console.error(`Could not save value to ${this.control.config.useStorage}!`, { control: this.control, error });
      }
    }
  }

  public clearStorageValue() {
    const storage = this._getStorage();
    if (storage) {
      try {
        const sessionStorageValue = storage.getItem(this.control.name);
        if (sessionStorageValue) storage.removeItem(this.control.name);
      } catch (error) {
        console.error(`Could not clear value from ${this.control.config.useStorage}!`, { control: this.control, error });
      }
    }
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
      if (this.control.expectGroup) {
        const entries = this.control.activeControls.map((control) => {
          const exists = valueExists(control.value);
          if (!exists) return [control.name, undefined];
          return [control.name, control.value];
        });
        return Object.fromEntries(entries);
      }
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
        Object.values(this.control.managers.controls.group).forEach((control) => {
          const { name } = control.field;
          const updatedValue = _get(value, [name], patch ? control.value : undefined);
          control.setValue(updatedValue, setAsDirty);
        });
      }
      this._syncCurrentValue(setAsDirty, true);
    } else if (this.control.hasControls) {
      this.control.controls.forEach((control) => {
        control.managers.value._emitChanges('children');
      });
    } else {
      this._emitChanges('parent');
    }
  }

  /**
   * @Internal
   */
  public _syncCurrentValue(setAsDirty = true, emitEvent = true, update: 'parent' | 'children' | 'none' = 'parent') {
    const value = this._resolveValue();
    this._value = value;
    if (setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this._emitChanges(update);
    else if (update === 'parent') this._syncParentValue(setAsDirty, emitEvent);
    else if (update === 'children') this._syncChildValues(setAsDirty, emitEvent);
  }
}

export { ValueManager };
