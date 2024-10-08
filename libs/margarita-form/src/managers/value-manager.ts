import { debounceTime, skip } from 'rxjs';
import _get from 'lodash.get';
import { BaseManager, ManagerName } from './base-manager';
import { CommonRecord, MFC, MFF } from '../typings/margarita-form-types';
import { valueIsDefined } from '../helpers/check-value';
import { nanoid } from 'nanoid';
import { resolve, getResolverOutputObservable } from '../helpers/resolve-function-outputs';
import { valueIsAsync } from '../helpers/async-checks';
import { coreResolver } from '../helpers/core-resolver';

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    value: ValueManager<MFC>;
  }
}

class ValueManager<CONTROL extends MFC> extends BaseManager<CONTROL['value']> {
  public static override managerName: ManagerName = 'value';
  private initialized = false;

  constructor(public override control: CONTROL) {
    super(control);
  }

  public override prepare() {
    const initialValue = this._getInitialValue();
    if (valueIsDefined(initialValue)) {
      this._setValue(initialValue, this.control.config.runTransformersForInitialValues);
    }
    this.initialized = true;
  }

  public override afterInitialize() {
    this._handleValueResolver();

    this.control.activeExtensions.forEach((extension) => {
      const { getValueObservable, handleValueUpdate } = extension;
      if (getValueObservable) {
        this.createSubscription(getValueObservable(this.control), (value) => this.updateValue(value));
      }

      if (handleValueUpdate) {
        const changes = this.changes.pipe(debounceTime(500), skip(1));
        this.createSubscription(changes, () => {
          handleValueUpdate(this.control, this.value);
        });
      }
    });
  }

  private async _handleValueResolver() {
    const { valueResolver } = this.control.field;

    if (valueResolver) {
      const resolver = resolve({
        getter: valueResolver,
        control: this.control,
      });

      const isAsync = valueIsAsync(resolver);
      if (isAsync) {
        if (resolver instanceof Promise) {
          const value = await resolver;
          this.updateValue(value, true, true, false);
        } else {
          const resolverObservable = getResolverOutputObservable('valueResolver', resolver, this.control);
          this.createSubscription(resolverObservable, (value) => {
            this.updateValue(value, true, true, false);
          });
        }
      } else {
        this.updateValue(resolver, true, true, false);
      }
    }
  }

  private _setValue(value: unknown, _useTransformer = true) {
    // Add metadata to value
    const _addMetadata = () => {
      const { addMetadata } = this.control.config;
      if (addMetadata && typeof value === 'object' && !Array.isArray(value)) {
        const { key, name, uid } = this.control;
        const { _uid = uid || nanoid(4) } = (this.value || {}) as CommonRecord;
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

    const _value =
      _useTransformer && transformer
        ? resolve({ getter: transformer, control: this.control, contextData: { value: _valueWithMetadata } })
        : _valueWithMetadata;

    // Set value
    this.value = _value;
    if (this.initialized) this.control.updateUid();
  }

  private _emitChanges() {
    this.emitChange(this.value);
  }

  public _getInitialValue(allowExtensionValue = true) {
    const { field, activeExtensions, config } = this.control;
    const { allowValueToBeFunction } = config;
    const inheritedValue = this._getInheritedValue();
    if (inheritedValue !== undefined) return inheritedValue;
    if (valueIsDefined(this.control.field.initialValue)) {
      return allowValueToBeFunction ? field.initialValue : coreResolver(field.initialValue, this.control);
    }

    if (allowExtensionValue) {
      const snapshots = activeExtensions.map(({ getValueSnapshot }) => getValueSnapshot);

      const result = snapshots.reduce((acc, snapshot) => {
        if (valueIsDefined(acc)) return acc;
        if (!snapshot) return acc;
        return snapshot(this.control);
      }, undefined as unknown);
      if (valueIsDefined(result) && !valueIsAsync(result)) return result;
    }

    return this.getDefaultValue();
  }

  public getDefaultValue() {
    const { field, config } = this.control;
    const { allowValueToBeFunction } = config;
    return allowValueToBeFunction ? field.defaultValue : coreResolver(field.defaultValue, this.control);
  }

  private _getInheritedValue() {
    if (this.control.isRoot) return undefined;
    const { expectFlat, fields, expectChildControls } = this.control;
    const { value: parentValue, expectArray } = this.control.parent || {};
    if (typeof parentValue !== 'object') return undefined;

    if (expectArray) {
      const inheritedValue = _get(parentValue, this.control.index, undefined);
      if (inheritedValue !== undefined) {
        return inheritedValue;
      }
    } else if (expectFlat && expectChildControls) {
      const reducer = (acc: CommonRecord, field: MFF): CommonRecord => {
        const resolvedName = coreResolver(field.name, this.control);
        if (field.grouping === 'flat' && field.fields) {
          const inheritedValue: CommonRecord = field.fields.reduce(reducer, {});
          return { ...acc, ...inheritedValue };
        }
        acc[resolvedName] = _get(parentValue, [resolvedName], undefined);
        return acc;
      };

      const inheritedValue = fields.reduce(reducer, {});

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

  /**
   * Get current value of the control
   */
  public get current(): CONTROL['value'] {
    if (!this.control.isRoot && this.control.parent.expectArray) {
      return this.value;
    }
    return this.value;
  }

  public refreshSync(origin = true, initial = true) {
    // console.debug('Refresh sync:', this.control.name, this.control.key);

    // Sync children
    const { expectArray } = this.control;
    const valueIsArray = Array.isArray(this.value);
    if (initial && expectArray && valueIsArray) {
      this._syncUpstreamValue(false, false, true);
    }

    this.control.controls.forEach((control) => {
      control.managers.value.refreshSync(false, initial);
    });

    // Update key (just in case)
    this.control.updateKey();

    // Sync own value
    const value = this._resolveValue();
    const runTransformer = !initial || this.control.config.runTransformersForInitialValues;
    this._setValue(value, runTransformer);

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
      this._syncUpstreamValue(patch, setAsDirty, emitEvent);
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

  public _syncUpstreamValue(patch: boolean, setAsDirty = true, emitEvent = true) {
    const currentValue = this.value;
    const { hasControls, expectArray, controls } = this.control;

    // console.debug('Sync upstream value:', currentValue);
    const exists = valueIsDefined(currentValue);
    if (!exists && hasControls) {
      // Clear or remove all controls
      const copy = [...controls];
      copy.forEach((control) => {
        if (expectArray) {
          control.parent.managers.controls.removeControl(control.key, false);
        } else {
          control.managers.value.updateValue(undefined, setAsDirty, emitEvent, false, false, true);
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
          const exists = valueIsDefined(value);
          if (!exists && isArray) {
            control.parent.managers.controls.removeControl(control.key, false);
          }
        } else if (isMap) {
          const value = (currentValue as CommonRecord)[control.name];
          const exists = valueIsDefined(value);
          if (!exists && !patch) {
            control.managers.value.updateValue(undefined, setAsDirty, emitEvent, false, false, true);
          }
        }
      });

      Object.entries(currentValue).forEach(([key, value]) => {
        if (['_key', '_name', '_uid'].includes(key)) return;
        const control = this.control.getControl(key);
        if (control) {
          return control.managers.value.updateValue(value, setAsDirty, emitEvent, false, false, true);
        }

        const childIsFlat = this.control.controls.some((child) => child.expectFlat);

        if (childIsFlat) {
          const childControl = this.control.controls.flatMap((control) => control.controls).find((child) => child.name === key);

          if (childControl) {
            return childControl.managers.value.updateValue(value, setAsDirty, emitEvent, false, false, true);
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
          initialValue: value as any,
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
    const { sortValues } = this.control.config;
    const { expectFlat } = childControl;
    this.control.updateKey();

    const exists = valueIsDefined(childControl.value);
    const value = exists ? childControl.value : this.getUndefinedValue(childControl);
    const key = expectArray ? childControl.index : childControl.name;

    if (this.value && expectFlat) this.value = { ...this.value, ...value };
    else if (this.value) this.value[key] = value;
    else if (expectGroup) this.value = { [key]: value };
    else if (expectArray) this.value = [value];
    else if (expectFlat) this.value = { ...value };
    if (sortValues) {
      const entries = Object.entries(this.value).sort(([a]: any, [b]: any) => (sortValues === 'asc' ? (a > b ? 1 : -1) : a < b ? 1 : -1));
      this.value = Object.fromEntries(entries);
    }
    if (setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this._emitChanges();
    if (!isRoot) this.control.parent.managers.value._syncDownstreamValue(this.control, setAsDirty, emitEvent);
  }

  /**
   * @Internal
   */
  private _resolveValue(): CONTROL['value'] {
    const { expectChildControls, expectArray, activeControls } = this.control;
    const { sortValues } = this.control.config;
    if (!expectChildControls) return this.value;

    const hasActiveControls = activeControls.length > 0;
    if (!hasActiveControls) return undefined;

    const entries = activeControls.reduce((acc, child) => {
      const exists = valueIsDefined(child.value);
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

    if (sortValues) entries.sort(([a]: any, [b]: any) => (sortValues === 'asc' ? (a > b ? 1 : -1) : a < b ? 1 : -1));

    const obj = Object.fromEntries(entries);
    if (expectArray) return Object.values(obj);
    return obj;
  }
}

export { ValueManager };
