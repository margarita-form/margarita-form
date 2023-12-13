import { nanoid } from 'nanoid';
import { MargaritaFormControl, createMargaritaForm } from '../index';
import { createState } from '../managers/state-manager-helpers/state-factory';
import { GeneralState } from '../managers/state-manager-helpers/state-classes';

declare module '../typings/margarita-form-types' {
  interface MargaritaFormState {
    customState: string;
  }
}

const customState = createState(GeneralState, 'customState', 'customValue');

MargaritaFormControl.addState(customState);

describe('Custom state testing', () => {
  it('should create form with custom state included', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
    });

    expect(form.state.customState).toBeDefined();
    expect(form.state.customState).toBe('customValue');

    await form.updateState({
      customState: 'updatedValue',
    });

    expect(form.state.customState).toBe('updatedValue');
  });
});
