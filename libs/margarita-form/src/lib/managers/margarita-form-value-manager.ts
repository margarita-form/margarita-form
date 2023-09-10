import { BehaviorSubject, debounceTime, skip } from 'rxjs';
import _get from 'lodash.get';
import { BaseManager } from './margarita-form-base-manager';
import { CommonRecord, MFC } from '../margarita-form-types';
import { valueExists } from '../helpers/check-value';
import { nanoid } from 'nanoid';

class ValueManager<CONTROL extends MFC> extends BaseManager {
  private initialized = false;
  private _value: CONTROL['value'] = undefined;
  public changes: BehaviorSubject<CONTROL['value']>;

  constructor(public control: CONTROL) {
    super();

    const initialValue = this._getInitialValue();
    // console.debug('Initial Value for ', this.control.name, ':', initialValue);

    if (initialValue) {
      this._setValue(initialValue);
    }

    this.changes = new BehaviorSubject<CONTROL['value']>(this._value);
    this.initialized = true;
  }

  public override _init() {
    const { storage, syncronization } = this.control.extensions;
    const changes = this.changes.pipe(debounceTime(500), skip(1));
    const { useStorage, useSyncronization } = this.control.field;
    const shouldListen = useStorage || useSyncronization;
    if (shouldListen) {
      this.createSubscription(changes, () => {
        if (useStorage) storage.saveStorageValue(this._value);
        if (useSyncronization) syncronization.broadcastChange(this._value);
      });
    }

    if (useSyncronization) {
      try {
        const subscription = syncronization.subscribeToMessages<CONTROL['value']>(
          (value) => this.updateValue(value, true, false),
          () => this._value
        );

        if (subscription && subscription.observable) {
          this.createSubscription(subscription.observable.pipe(), subscription.handler);
        }
      } catch (error) {
        console.error(`Could not syncronize value!`, { control: this.control, error });
      }
    }

    if (useStorage) {
      try {
        const observable = storage.getStorageValueListener<CONTROL['value']>();

        if (observable) {
          this.createSubscription(observable.pipe(debounceTime(500), skip(1)), (value) => this.updateValue(value, false, true, false));
        }
      } catch (error) {
        console.error(`Could not subscribe to storage changes!`, { control: this.control, error });
      }
    }
  }

  private _setValue(value: unknown) {
    // Add metadata to value
    const _addMetadata = () => {
      const { addMetadata } = this.control.config;
      if (addMetadata && typeof value === 'object' && !Array.isArray(value)) {
        const { key, name, uid } = this.control;
        const { _uid = uid || nanoid(4) } = (this._value || {}) as CommonRecord;
        return {
          _key: key,
          _name: name,
          _uid: _uid,
          ...value,
        };
      }
      return value;
    };

    const _valueWithMetadata = _addMetadata();

    // Transform value with custom transformer script
    const { transformer } = this.control.field;
    const _value = transformer ? transformer({ value: _valueWithMetadata, control: this.control }) : _valueWithMetadata;

    // Set value
    this._value = _value;
    if (this.initialized) this.control.updateUid();
  }

  private _emitChanges() {
    this.control.updateSyncId();
    this.changes.next(this._value);
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
    const { field, expectFlat } = this.control;
    const { value: parentValue, expectArray } = this.control.parent || {};
    if (typeof parentValue !== 'object') return undefined;

    if (expectArray) {
      const inheritedValue = _get(parentValue, this.control.index, undefined);
      if (inheritedValue !== undefined) {
        return inheritedValue;
      }
    } else if (expectFlat && field.fields) {
      const inheritedValue = field.fields.reduce((acc, field) => {
        acc[field.name] = _get(parentValue, [field.name], undefined);
        return acc;
      }, {} as CommonRecord);

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
    if (!this.control.isRoot && this.control.parent.expectArray) {
      // return this._value?.value;
      return this._value;
    }
    return this._value;
  }

  public refreshSync(origin = true, initial = true) {
    // console.debug('Refresh sync:', this.control.name, this.control.key);

    // Sync children
    const { expectArray } = this.control;
    const valueIsArray = Array.isArray(this._value);
    if (initial && expectArray && valueIsArray) {
      this._syncUpstreamValue(false);
    }

    this.control.controls.forEach((control) => {
      control.managers.value.refreshSync(false, initial);
    });

    // Update key (just in case)
    this.control.updateKey();

    // Sync own value
    const value = this._resolveValue();
    this._setValue(value);

    // Emit initial value
    this._emitChanges();

    if (!this.control.isRoot && origin) this.control.parent.managers.value._syncDownstreamValue(this.control, false, true);
    // console.debug('Done:', this.control.name);
  }

  /**
   * Set value of the control
   * @param value value to set
   * @param setAsDirty update dirty state to true
   */
  public updateValue(value: unknown, setAsDirty = true, emitEvent = true, patch = false, updateParent = true, updateChildren = true) {
    this._setValue(value);
    this._syncValue(setAsDirty, emitEvent, patch, updateParent, updateChildren);
  }

  public async _syncValue(setAsDirty = true, emitEvent = true, patch = false, updateParent = false, updateChildren = false) {
    // console.debug('Sync update value:', this.control.name, this.control.key);

    // Step 1, create or delete changed array children
    if (this.control.expectChildControls && updateChildren) {
      this._syncUpstreamValue(patch);
    }

    // Step 2, update key
    this.control.updateKey();

    // Step 3, sync own value
    const value = this._resolveValue();
    this._setValue(value);

    // Step 4, sync parent value
    if (!this.control.isRoot && updateParent) {
      this.control.parent.managers.value._syncDownstreamValue(this.control, setAsDirty, emitEvent);
    }

    // Step 5, emit changes
    if (setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this._emitChanges();
    // console.debug('Done:', this.control.name);
  }

  public _syncUpstreamValue(patch: boolean) {
    const currentValue = this._value;
    const { hasControls, expectArray, controls } = this.control;

    // console.debug('Sync upstream value:', currentValue);
    const exists = valueExists(currentValue);
    if (!exists && hasControls) {
      // Clear or remove all controls
      const copy = [...controls];
      copy.forEach((control) => {
        if (expectArray) {
          control.parent.managers.controls.removeControl(control.key, false);
        } else {
          control.managers.value.updateValue(undefined, true, true, false, false, true);
        }
      });
    } else if (typeof currentValue === 'object') {
      const isArray = Array.isArray(currentValue);
      const isMap = !isArray && typeof currentValue === 'object';

      // Update or delete controls
      const copy = [...controls];
      copy.forEach((control, index) => {
        if (isArray) {
          const value = currentValue[index];
          const exists = valueExists(value);
          if (!exists && isArray) {
            control.parent.managers.controls.removeControl(control.key, false);
          }
        } else if (isMap) {
          const value = (currentValue as CommonRecord)[control.name];
          const exists = valueExists(value);
          if (!exists && !patch) {
            control.managers.value.updateValue(undefined, true, true, false, false, true);
          }
        }
      });

      Object.entries(currentValue).forEach(([key, value]) => {
        if (['_key', '_name', '_uid'].includes(key)) return;
        const control = this.control.getControl(key);
        if (control) {
          const dirty = false;
          const emit = true;
          const patch = false;

          return control.managers.value.updateValue(value, dirty, emit, patch, false, true);
        }

        const childIsFlat = this.control.controls.some((child) => child.expectFlat);

        if (childIsFlat) {
          const childControl = this.control.controls.flatMap((control) => control.controls).find((child) => child.name === key);

          if (childControl) {
            const dirty = false;
            const emit = true;
            const patch = false;

            return childControl.managers.value.updateValue(value, dirty, emit, patch, false, true);
          }
        }

        const resolveFieldIdentifier = () => {
          if (!isArray) return key;
          if (!value || typeof value !== 'object' || Array.isArray(value)) return 0;
          if ('_name' in (value as CommonRecord)) return (value as CommonRecord)['_name'] as string;
          return 0;
        };

        const fieldIdentifier = resolveFieldIdentifier();

        this.control.managers.controls.appendRepeatingControl(fieldIdentifier, {
          initialValue: value,
        });
      });
    }
  }

  private getUndefinedValue(control: MFC) {
    const { transformUndefinedToNull, allowEmptyString } = control.config;
    const { value } = control;
    if (allowEmptyString && value === '') return value;
    const val = transformUndefinedToNull ? null : undefined;
    return val;
  }

  public _syncDownstreamValue(childControl: MFC, setAsDirty = true, emitEvent = true) {
    // console.debug('Sync Downstream value:', this.control.name);
    const { expectArray, expectGroup, isRoot } = this.control;
    const { expectFlat } = childControl;
    this.control.updateKey();

    const exists = valueExists(childControl.value);
    const value = exists ? childControl.value : this.getUndefinedValue(childControl);
    const key = expectArray ? childControl.index : childControl.name;

    if (this._value && expectFlat) this._value = { ...this._value, ...value };
    else if (this._value) this._value[key] = value;
    else if (expectGroup) this._value = { [key]: value };
    else if (expectArray) this._value = [value];
    else if (expectFlat) this._value = { ...value };

    if (setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this._emitChanges();
    if (!isRoot) this.control.parent.managers.value._syncDownstreamValue(this.control, setAsDirty, emitEvent);
  }

  /**
   * @Internal
   */
  private _resolveValue(): CONTROL['value'] {
    const { expectChildControls, expectArray } = this.control;
    if (!expectChildControls) return this._value;

    const entries = this.control.activeControls.reduce((acc, child) => {
      const exists = valueExists(child.value);
      const key = expectArray ? child.index : child.name;
      if (!exists) {
        const val = this.getUndefinedValue(child);
        if (val !== undefined) acc.push([key, val]);
      } else if (child.value && child.expectFlat && typeof child.value === 'object') {
        const childEntries = Object.entries(child.value);
        acc.push(...childEntries);
      } else {
        acc.push([key, child.value]);
      }
      return acc;
    }, [] as [PropertyKey, unknown][]);

    const obj = Object.fromEntries(entries);
    if (expectArray) return Object.values(obj);
    return obj;
  }
}

export { ValueManager };
