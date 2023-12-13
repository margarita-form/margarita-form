import { createMargaritaForm } from '../../index';
import { phoneValidator } from './phone-validator';

const validator = phoneValidator(true, 'Please enter a valid phone number');

describe('phoneValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'phone-validator-test-form',
      initialValue: undefined,
      validation: { required: false, phone: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for valid phone number', async () => {
    const form = createMargaritaForm({
      name: 'phone-validator-test-form',
      initialValue: '+1234567890',
      validation: { required: false, phone: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for invalid phone number', async () => {
    const form = createMargaritaForm({
      name: 'phone-validator-test-form',
      initialValue: 'invalid phone number',
      validation: { required: false, phone: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ phone: 'Please enter a valid phone number' });
    form.cleanup();
  });
});
