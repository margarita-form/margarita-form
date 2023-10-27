import { createMargaritaForm } from '../../create-margarita-form';
import { eaqualsToValidator } from './eaquals-to-validator';

const validator = eaqualsToValidator('requiredValue', 'Value does not equal to required value!');

describe('eaqualsToValidator', () => {
  it('should return valid for empty value when not required', async () => {
    const form = createMargaritaForm({
      name: 'eaquals-to-validator-test-form',
      initialValue: undefined,
      validation: { required: false, eaqualsTo: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for matching value', async () => {
    const form = createMargaritaForm({
      name: 'eaquals-to-validator-test-form',
      initialValue: 'requiredValue',
      validation: { required: true, eaqualsTo: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for non-matching value', async () => {
    const form = createMargaritaForm({
      name: 'eaquals-to-validator-test-form',
      initialValue: 'notRequiredValue',
      validation: { required: true, eaqualsTo: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ eaqualsTo: 'Value does not equal to required value!' });
    form.cleanup();
  });
});
