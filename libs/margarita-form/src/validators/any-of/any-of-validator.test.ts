import { createMargaritaForm } from '../../index';
import { anyOfValidator } from './any-of-validator';

const validator = anyOfValidator(['red', 'green', 'blue'], 'Please enter a valid color');

describe('anyOfValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'any-of-validator-test-form',
      initialValue: undefined,
      validation: { required: false, anyOf: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid value', async () => {
    const form = createMargaritaForm({
      name: 'any-of-validator-test-form',
      initialValue: 'red',
      validation: { required: false, anyOf: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid value', async () => {
    const form = createMargaritaForm({
      name: 'any-of-validator-test-form',
      initialValue: 'yellow',
      validation: { required: false, anyOf: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ anyOf: 'Please enter a valid color' });
    form.cleanup();
  });
});
