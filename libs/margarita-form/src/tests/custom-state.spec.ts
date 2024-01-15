import { nanoid } from 'nanoid';
import { MargaritaFormControl, createMargaritaForm } from '../index';
import { createState } from '../managers/state-manager-helpers/state-factory';
import { BooleanPairState, GeneralState } from '../managers/state-manager-helpers/state-classes';

declare module '../typings/margarita-form-types' {
  interface MargaritaFormState {
    customState: string;
    booleanStateDefault: boolean;
    booleanStateInverse: boolean;
  }
}

const customGeneralState = createState(GeneralState, 'customState', 'customValue');
const customBooleanState = createState(BooleanPairState, 'booleanStateDefault', 'booleanStateInverse', false);

MargaritaFormControl.addStates(customGeneralState);

describe('Custom state testing', () => {
  it('should create form with custom general state that is globally configured', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
    });

    expect(form.state.customState).toBeDefined();
    expect(form.state.customState).toBe('customValue');

    await form.updateState({
      customState: 'updatedValue',
    });

    expect(form.state.customState).toBe('updatedValue');
    expect(form.state.booleanStateDefault).not.toBeDefined();
    expect(form.state.booleanStateInverse).not.toBeDefined();
  });

  it('should create form with custom boolean state from field', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      customStates: [customBooleanState],
    });

    expect(form.state.customState).toBeDefined();
    expect(form.state.customState).toBe('customValue');

    expect(form.state.booleanStateDefault).toBeDefined();
    expect(form.state.booleanStateDefault).toBe(true);
    expect(form.state.booleanStateInverse).toBeDefined();
    expect(form.state.booleanStateInverse).toBe(false);
  });
});
