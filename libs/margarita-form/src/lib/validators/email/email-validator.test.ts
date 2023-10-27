import { createMargaritaForm } from '../../create-margarita-form';
import { emailValidator } from './email-validator';

const validator = emailValidator(true, 'Please enter a valid email address');

describe('emailValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'email-validator-test-form',
      initialValue: undefined,
      validation: { required: false, email: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid email address', async () => {
    const form = createMargaritaForm({
      name: 'email-validator-test-form',
      initialValue: 'test@example.com',
      validation: { required: false, email: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid email address', async () => {
    const form = createMargaritaForm({
      name: 'email-validator-test-form',
      initialValue: 'invalid email',
      validation: { required: false, email: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ email: 'Please enter a valid email address' });
    form.cleanup();
  });
});
