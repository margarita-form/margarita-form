import { BehaviorSubject, debounceTime } from 'rxjs';
import _get from 'lodash.get';
import { BaseManager } from './margarita-form-base-manager';
import { CommonRecord, MFC } from '../margarita-form-types';
import { valueExists } from '../helpers/check-value';

class ValueManager<CONTROL extends MFC> extends BaseManager {
  private _value: CONTROL['value'] = undefined;
  public changes = new BehaviorSubject<CONTROL['value']>(undefined);

  constructor(public control: CONTROL) {
    super();

    const initialValue = this._getInitialValue();
    // console.debug('Initial Value for ', this.control.name, ':', initialValue);

    if (initialValue) {
      this._setValue(initialValue);
    }
  }

  public override _init() {
    const { storage, syncronization } = this.control.extensions;
    const changes = this.changes.pipe(debounceTime(10));

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

  private _setValue(value: unknown) {
    if (!this.control.isRoot && this.control.parent.expectArray) {
      // this._value = {
      //   value,
      //   key: this.control.key,
      //   name: this.control.name,
      // };
      this._value = value;
    } else {
      this._value = value;
    }
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
    if (!this.control.isRoot && this.control.parent.expectArray) {
      // return this._value?.value;
      return this._value;
    }
    return this._value;
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

  public refreshSync() {
    console.debug('Refresh sync:', this.control.name, this.control.key);

    // Sync children
    this.control.controls.forEach((control) => {
      control.managers.value.refreshSync();
    });

    // Update key (just in case)
    this.control.updateKey();

    // Sync own value
    const value = this._resolveValue();
    this._setValue(value);

    // Emit initial value
    this._emitChanges();
    console.debug('Done:', this.control.name);
  }

  public async _syncValue(setAsDirty = true, emitEvent = true, patch = false, updateParent = false, updateChildren = false) {
    console.debug('Sync update value:', this.control.name, this.control.key);
    // Step 1, create or delete changed array children
    if (this.control.expectChildControls && updateChildren) {
      this._syncUpstreamValue();
    }

    // Step 2, update children
    // this.control.controls.forEach((control) => {
    //   console.log('updateChildren', updateChildren);

    //   control.managers.value._syncValue(setAsDirty, emitEvent, false, false, updateChildren);
    // });

    // Step 3, update self
    this.control.updateKey();

    if (!updateChildren || patch) {
      const value = this._resolveValue();
      this._setValue(value);
    }

    if (updateParent) {
      this.control.parent.managers.value._syncDownstreamValue(this.control, setAsDirty, emitEvent);
    }

    if (setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this._emitChanges();
    console.debug('Done:', this.control.name);
  }

  public _syncUpstreamValue() {
    const currentValue = this._value;

    console.debug('Sync upstream value:', currentValue);

    if (typeof currentValue === 'object') {
      // const isArray = Array.isArray(value);
      const { addMetadataToArrays, detectAndRemoveMetadataForArrays, allowUnresolvedArrayChildNames } = this.control.config;
      const checkMetadata = addMetadataToArrays || detectAndRemoveMetadataForArrays;

      const parseValue = (currentValue: any) => {
        try {
          if (addMetadataToArrays === 'flat') {
            const { key, name, ...rest } = currentValue;
            if (Object.keys(rest).length === 0) return { key, name, value: undefined };
            return { key, name, value: rest };
          }

          if (checkMetadata) {
            const { key, name, ...rest } = currentValue;
            if ('value' in rest) return { key, name, value: rest.value };
            if (Object.keys(rest).length > 0) return { key, name, value: rest };
            return { key, name, value: undefined };
          }
        } catch (error) {
          console.error('Parse value error:', error);
        }

        return { value: currentValue, key: undefined };
      };

      const resolveValueAndKey = (currentValue: any) => {
        const currentValueExists = valueExists(currentValue);
        if (currentValueExists) return parseValue(currentValue);
        return { value: undefined, key: undefined, name: undefined };
      };

      const isArray = Array.isArray(currentValue);

      if (isArray) {
        console.debug('Removals for:', this.control.name, this.control.key);

        this.control.controls.forEach((control, index) => {
          const exists = valueExists(currentValue[index]);
          // if (!exists) return control.remove();
          if (!exists) {
            console.debug('Remove control:', { index, control: control.name, key: control.key });
            control.parent.managers.controls.removeControl(control.key, false);
          }
        });
      }

      console.debug('Additions and updates for:', this.control.name, this.control.key);

      Object.entries(currentValue).forEach(([key, value]) => {
        const control = this.control.getControl(key);
        if (control) {
          console.debug('Update control:', { key, value });

          const dirty = false;
          const emit = true;
          const patch = false;

          control.managers.value.updateValue(value, dirty, emit, patch, false, true);
        } else {
          console.debug('Create control:', { key, value });
          // For arrays key is number, for objects key is string

          const resolveFieldIdentifier = () => {
            if (!isArray) return key;
            if (!value) return 0;
            if (addMetadataToArrays && 'key' in (value as CommonRecord)) return (value as CommonRecord)['key'] as string;
            return 0;
          };

          const fieldIdentifier = resolveFieldIdentifier();

          this.control.managers.controls.appendRepeatingControl(fieldIdentifier, {
            initialValue: value,
          });
        }
      });
    }
  }

  public _syncDownstreamValue(childControl: MFC, setAsDirty = true, emitEvent = true) {
    console.debug('Sync Downstream value:', this.control.name);

    this.control.updateKey();
    const { expectArray, expectGroup, expectFlat, isRoot } = this.control;
    // const parentIsArray = !isRoot && this.control.parent.expectArray;
    const value = childControl.value;
    const key = expectArray ? childControl.index : childControl.name;

    // if (parentIsArray) {
    //   if (this._value.value) this._value.value[key] = value;
    //   else this._value.value = { [key]: value };
    //   if (expectArray) this._value.value = Object.values(this._value);
    // } else {
    //   if (this._value) this._value[key] = value;
    //   else this._value = { [key]: value };
    //   if (expectArray) this._value = Object.values(this._value);
    // }

    if (this._value) this._value[key] = value;
    else if (expectGroup) this._value = { [key]: value };
    else if (expectArray) this._value = [value];
    // else if (expectFlat) this._value = [value];
    // if (expectArray) this._value = Object.values(this._value);

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
      if (!exists) acc.push([key, undefined]);
      else if (child.value && child.expectFlat && typeof child.value === 'object') {
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

  private _resolveValueOG(): CONTROL['value'] {
    if (this.control.expectChildControls) {
      if (!this.control.hasControls) return undefined;
      if (this.control.expectArray) {
        return this.control.activeControls.reduce((acc, control) => {
          if (control.expectFlat) throw { message: 'Flat controls cannot be added to array!', control };
          if (control.config.addMetadataToArrays) {
            if (control.config.addMetadataToArrays === 'flat') {
              const isGroup = control.expectGroup;
              if (!isGroup)
                throw 'To add metadata to array where child is not an object, change "addMetadataToArrays" to true instead of "flat"!';

              const value = valueExists(control.value) ? (control.value as CommonRecord) : {};
              if (typeof value !== 'object') throw 'Cannot add flat metadata to array where child is not an object!';
              if ('name' in value) throw 'Cannot add flat metadata to array where child has "name" property!';
              if ('key' in value) throw 'Cannot add flat metadata to array where child has "key" property!';

              acc.push({
                ...value,
                key: control.key,
                name: control.name,
              });
              return acc;
            }
            acc.push({
              value: control.value,
              key: control.key,
              name: control.name,
            });
            return acc;
          }
          acc.push(control.value);
          return acc;
        }, [] as CONTROL['value']);
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
    console.trace('INVALID FUNCTION CALLED');
    /*
    if (!this.control.isRoot) {
      this.control.parent.managers.value._syncCurrentValue(setAsDirty, emitEvent);
    }
    */
  }

  /**
   * @Internal
   */
  public _syncChildValuesOG(setAsDirty = true, patch = false) {
    const value: unknown = this._value;
    if (this.control.expectChildControls) {
      if (this.control.expectArray) {
        const isArray = Array.isArray(value);
        const { addMetadataToArrays, detectAndRemoveMetadataForArrays, allowUnresolvedArrayChildNames } = this.control.config;
        const checkMetadata = addMetadataToArrays || detectAndRemoveMetadataForArrays;

        const parseValue = (currentValue: any) => {
          try {
            if (addMetadataToArrays === 'flat') {
              const { key, name, ...rest } = currentValue;
              if (Object.keys(rest).length === 0) return { key, name, value: undefined };
              return { key, name, value: rest };
            }

            if (checkMetadata) {
              const { key, name, ...rest } = currentValue;
              if ('value' in rest) return { key, name, value: rest.value };
              if (Object.keys(rest).length > 0) return { key, name, value: rest };
              return { key, name, value: undefined };
            }
          } catch (error) {
            console.error('Parse value error:', error);
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
            const { value: _value, name, key } = resolveValueAndKey(currentValue);
            const control = this.control.getControl(key) || this.control.getControl(index);
            if (control) {
              const isTheExpectedControl = checkMetadata && control.name === name;
              if (isTheExpectedControl) return;
              control.updateKey();
              const validValue = valueExists(_value);
              if (validValue || !patch) return control.setValue(_value, setAsDirty, false);
            } else {
              const couldNotResolveType = !name && this.control.fields.length > 1 && !allowUnresolvedArrayChildNames;

              if (couldNotResolveType) {
                console.warn(
                  'Could not resolve name of array item with certainty. To be safe, provide "addMetadataToArrays: true" to the array field config. To hide this message add "allowUnresolvedArrayChildNames: true" to the array field config."',
                  { index, value: _value, parent: this.control }
                );
              }

              const addedControl = this.control.managers.controls.appendRepeatingControl(name, {
                initialValue: _value,
              });
              addedControl.updateKey();
            }
          });
        }

        const controls = [...this.control.controls]; // Copy array to avoid problems caused by mutation of original array

        controls.forEach((control, index) => {
          control.managers.value._syncCurrentValue(false, false, 'children');
          const resolveCurrentValue = () => {
            if (isArray) {
              if (checkMetadata) {
                return this._value.find((val) => val.key === control.key);
              }
              return this._value[index];
            }
            return this._value;
          };
          const currentValue: any = resolveCurrentValue();
          const hasValue = valueExists(currentValue);
          if (!hasValue && !patch) {
            control.remove();
          } else {
            const { value: _value } = resolveValueAndKey(currentValue, control);
            control.updateKey();
            if (_value || !patch) control.setValue(_value, setAsDirty, false);
          }
        });
      } else {
        this._updateChildGroupValues(value, setAsDirty, patch);
      }
      this._syncCurrentValue(setAsDirty, true);
    } else {
      // this._emitChanges('parent', setAsDirty);
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
    // if (emitEvent) this._emitChanges(update, setAsDirty);
    else if (update === 'parent') this._syncParentValue(setAsDirty, emitEvent);
    else if (update === 'children') this._syncChildValues(setAsDirty, emitEvent);
  }

  public async _syncChildValues(setAsDirty = true, patch = false) {
    console.trace('WRONG FUNCTION CALLED');
  }
}

export { ValueManager };
