import { valueExists } from '../../helpers/check-value';
import { MargaritaForm } from '../../margarita-form';
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
    const { active } = state.toJSON(true);
    if (state.control.isRoot) return active;
    return state.control.parent.state.active;
  }),
];

export const createStates = (state: StateManager<MFC>) => {
  const defaultStates = defaultStateFactories.map((factory) => factory(state));
  const customStates = [...MargaritaForm.states].map((factory) => factory(state));
  state.registerStates([...defaultStates, ...customStates]);
  return state;
};
