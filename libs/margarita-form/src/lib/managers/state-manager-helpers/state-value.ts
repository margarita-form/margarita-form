import { valueExists } from '../../helpers/check-value';
import { MFC, MargaritaFormStateAllErrors, MargaritaFormStateChildren, MargaritaFormStateErrors } from '../../margarita-form-types';
import { StateManager } from '../margarita-form-state-manager';
import { BooleanPairState, DerivedState, GeneralState } from './state-classes';

export const createStates = (state: StateManager<MFC>) => {
  const errorsState = new GeneralState<MargaritaFormStateErrors>(state, 'errors', {});
  const allErrorsState = new GeneralState<MargaritaFormStateAllErrors>(state, 'allErrors', []);
  const childrenState = new GeneralState<MargaritaFormStateChildren>(state, 'children', []);
  const focusState = new GeneralState<boolean>(state, 'focus', false);
  const validatingState = new GeneralState<boolean>(state, 'validating', false);
  const submittedState = new GeneralState<boolean>(state, 'submitted', false);
  const submittingState = new GeneralState<boolean>(state, 'submitting', false);
  const submitResultState = new GeneralState<unknown>(state, 'submitResult', 'not-submitted');
  const submits = new GeneralState<number>(state, 'submits', 0);

  // Boolean pair states with current value only
  const validState = new BooleanPairState(state, 'valid', 'invalid');
  const pristineState = new BooleanPairState(state, 'pristine', 'dirty');
  const touchedState = new BooleanPairState(state, 'untouched', 'touched');
  // With snapshot value override
  const activeState = new BooleanPairState(state, 'active', 'inactive').setSnapshotValue(false);
  const enabledState = new BooleanPairState(state, 'enabled', 'disabled').setSnapshotValue(false);
  const editableState = new BooleanPairState(state, 'editable', 'readOnly').setSnapshotValue(false);
  const visibleState = new BooleanPairState(state, 'visible', 'hidden').setSnapshotValue(false);
  // Derived states
  const hasValueState = new DerivedState<boolean>(state, 'hasValue', (state) => valueExists(state.control.value));
  const shouldShowErrorsState = new DerivedState<boolean>(state, 'shouldShowError', (state) => {
    const { touched, dirty, focus, validated, invalid } = state.toJSON(true);
    const interacted = touched || (dirty && !focus);
    return interacted && validated && invalid;
  });
  const parentIsActiveState = new DerivedState<boolean>(state, 'parentIsActive', (state) => {
    const { active } = state.toJSON(true);
    if (state.control.isRoot) return active;
    return state.control.parent.state.active;
  });

  state.registerStates([
    errorsState,
    allErrorsState,
    childrenState,
    focusState,
    validatingState,
    submittedState,
    submittingState,
    submitResultState,
    submits,
    activeState,
    validState,
    pristineState,
    touchedState,
    enabledState,
    editableState,
    visibleState,
    hasValueState,
    shouldShowErrorsState,
    parentIsActiveState,
  ]);
  return state;
};
