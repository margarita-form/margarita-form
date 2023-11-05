import { createMargaritaForm } from '../../../index';
import { requiredValidator } from './required-validator';

describe('requiredValidator', () => {
  it('should return invalid for undefined value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: undefined,
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });
});
