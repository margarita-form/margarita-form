import { BehaviorSubject } from 'rxjs';
import _get from 'lodash.get';
import { BaseManager } from './margarita-form-base-manager';
import { MFC } from '../margarita-form-types';

class ValueManager<CONTROL extends MFC> extends BaseManager {
  #value: CONTROL['value'] = undefined;
  public changes = new BehaviorSubject<CONTROL['value']>(undefined);

  constructor(public control: CONTROL) {
    super();
    if (control.field.initialValue) this.#value = control.field.initialValue;
    const controlsSubscription = this.control.controlsManager.changes.subscribe(
      () => this._syncCurrentValue(false)
    );
    this.subscriptions.push(controlsSubscription);
  }

  #emitChanges() {
    this.changes.next(this.#value);
  }

  /**
   * Get current value of the control
   */
  public get current(): CONTROL['value'] {
    return this.#value;
  }

  /**
   * Set value of the control
   * @param value value to set
   * @param setAsDirty update dirty state to true
   */
  public updateValue(
    value: unknown,
    setAsDirty = true,
    emitEvent = true,
    patch = false
  ) {
    if (this.control.hasControls) {
      if (typeof value !== 'object') throw new Error('Value must be an object');
      try {
        const isArray = Array.isArray(value);
        if (this.control.expectArray && isArray) {
          this.control.controls.forEach((control, index) => {
            const hasValue = control && value[index];
            if (!hasValue && !patch) control.remove();
          });

          value.forEach((_value, index) => {
            const control = this.control.getControl(index);
            if (control) return control.setValue(_value, setAsDirty);

            return this.control.controlsManager.addTemplatedControl({
              initialValue: _value,
            });
          });
        } else if (!isArray) {
          return Object.values(this.control.controlsManager.group).forEach(
            (control) => {
              const { name } = control.field;
              const updatedValue = _get(
                value,
                [name],
                patch ? control.value : undefined
              );
              control.setValue(updatedValue, setAsDirty);
            }
          );
        } else {
          console.error('Could not set values!', {
            control: this,
            value,
            error: 'Trying to add array od values to non repeating controls!',
          });
        }
      } catch (error) {
        console.error('Could not set values!', {
          control: this,
          value,
          error,
        });
      }
    }

    this.#value = value;
    const isActive = this.control.state.active;
    if (isActive && setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this.#emitChanges();
    if (isActive) this._syncParentValue(setAsDirty, emitEvent);
  }

  /**
   * @Internal
   */
  #resolveValue(): CONTROL['value'] {
    if (this.control.hasControls) {
      if (this.control.expectArray) {
        return this.control.activeControls.map((control) => control.value);
      }
      const entries = this.control.activeControls.map((control) => {
        return [control.name, control.value];
      });
      return Object.fromEntries(entries);
    }
    return this.#value;
  }

  /**
   * @Internal
   */
  private _syncParentValue(setAsDirty = true, emitEvent = true) {
    if (!this.control.isRoot) {
      if (this.control.parent.valueManager) {
        this.control.parent.valueManager._syncCurrentValue(
          setAsDirty,
          emitEvent
        );
      }
    }
  }

  /**
   * @Internal
   */
  public _syncCurrentValue(setAsDirty = true, emitEvent = true) {
    const value = this.#resolveValue();
    this.#value = value;
    if (setAsDirty) this.control.updateStateValue('dirty', true);
    if (emitEvent) this.#emitChanges();
    this._syncParentValue(setAsDirty, emitEvent);
  }
}

export { ValueManager };
