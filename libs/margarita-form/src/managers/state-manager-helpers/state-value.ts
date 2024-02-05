import { valueExists } from '../../helpers/check-value';
import { MFC } from '../../typings/margarita-form-types';
import { StateManager } from '../state-manager';
import { BooleanPairState, DerivedState, GeneralState } from './state-classes';
import { createState } from './state-factory';

const defaultStateFactories = [
  // General states
  createState(GeneralState, 'errors', {}),
  createState(GeneralState, 'allErrors', []),
  createState(GeneralState, 'children', []),
  createState(GeneralState, 'focus', false),
  createState(GeneralState, 'valueChanged', false),
  createState(GeneralState, 'validating', false),
  createState(GeneralState, 'validated', false),
  createState(GeneralState, 'submitted', false),
  createState(GeneralState, 'submitting', false),
  createState(GeneralState, 'submitResult', 'not-submitted'),
  createState(GeneralState, 'submitOutput', undefined),
  createState(GeneralState, 'submits', 0),

  // Boolean pair states
  createState(BooleanPairState, 'valid', 'invalid'),
  createState(BooleanPairState, 'pristine', 'dirty'),
  createState(BooleanPairState, 'untouched', 'touched'),
  createState(BooleanPairState, 'active', 'inactive', false),
  createState(BooleanPairState, 'enabled', 'disabled', false),
  createState(BooleanPairState, 'editable', 'readOnly', false),
  createState(BooleanPairState, 'visible', 'hidden', false),

  // Derived states
  createState(DerivedState, 'hasValue', (state) => valueExists(state.control.value)),
  createState(DerivedState, 'shouldShowError', (state) => {
    const { touched, dirty, focus, validated, invalid } = state.toJSON(true);
    const interacted = touched || (dirty && !focus);
    return interacted && validated && invalid;
  }),
  createState(DerivedState, 'parentIsActive', (state) => {
    if (state.control.isRoot) {
      const { active } = state.toJSON(true);
      return active;
    }
    const parentActiveState = state.control.parent.managers.state.findState('active');
    if (!parentActiveState) return false;
    return parentActiveState.currentValue;
  }),
  createState(DerivedState, 'focusWithin', (state) => {
    const { focus } = state.toJSON(true);
    if (focus || !state.control.expectChildControls) return focus;
    return state.control.controls.some((ctrl) => {
      const focusWihinState = ctrl.managers.state.findState('focusWithin');
      if (!focusWihinState) return false;
      return focusWihinState.currentValue;
    });
  }),
];

export const createStates = (state: StateManager<MFC>) => {
  const defaultStates = defaultStateFactories.map((factory) => factory(state));
  const customStates = state.control._getStateFactories().map((factory) => factory(state));
  state.registerStates([...defaultStates, ...customStates]);
  return state;
};
