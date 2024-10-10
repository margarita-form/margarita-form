import { createMargaritaForm } from '../../index';
import { equalsToValidator } from './equals-to-validator';

const validator = equalsToValidator('requiredValue', 'Value does not equal to required value!');

describe('equalsToValidator', () => {
  it('should return valid for empty value when not required', async () => {
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: undefined,
      validation: { required: false, equalsTo: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for matching value', async () => {
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: 'requiredValue',
      validation: { required: true, equalsTo: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for non-matching value', async () => {
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: 'notRequiredValue',
      validation: { required: true, equalsTo: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ equalsTo: 'Value does not equal to required value!' });
    form.cleanup();
  });
});
