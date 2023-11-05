import { createMargaritaForm } from '../../../index';
import { passwordValidator } from './password-validator';

const _passwordValidator = passwordValidator();

describe('passwordValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'password-validator-test-form',
      initialValue: undefined,
      validation: { required: false, password: _passwordValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for "short" length', async () => {
    const form = createMargaritaForm({
      name: 'password-validator-test-form',
      initialValue: 'abc',
      validation: { required: false, password: passwordValidator('short') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ password: 'Password is not strong enough!' });
    form.cleanup();
  });

  it('should return valid for "regular" length', async () => {
    const form = createMargaritaForm({
      name: 'password-validator-test-form',
      initialValue: 'abc123',
      validation: { required: false, password: passwordValidator('regular') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({
      password: 'Password is not strong enough!',
    });
    form.cleanup();
  });

  it('should return valid for "medium" length', async () => {
    const form = createMargaritaForm({
      name: 'password-validator-test-form',
      initialValue: 'abc123ABC',
      validation: { required: false, password: passwordValidator('medium') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({
      password: 'Password is not strong enough!',
    });
    form.cleanup();
  });

  it('should return valid for "long" length', async () => {
    const form = createMargaritaForm({
      name: 'password-validator-test-form-123',
      initialValue: 'abc123ABC!@#def456DEF',
      validation: { required: false, password: passwordValidator('long') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for custom length of 5', async () => {
    const customValidator = passwordValidator(5, 'Password is too short!');
    const form = createMargaritaForm({
      name: 'password-validator-test-form',
      initialValue: 'abc!',
      validation: { required: false, password: customValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ password: 'Password is too short!' });
    form.cleanup();
  });

  it('should return invalid for custom length of 10', async () => {
    const customValidator = passwordValidator(10, 'Password is too short!');
    const form = createMargaritaForm({
      name: 'password-validator-test-form',
      initialValue: 'abc123!!!',
      validation: { required: false, password: customValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ password: 'Password is too short!' });
    form.cleanup();
  });

  it('should return valid for custom length more than 10', async () => {
    const customValidator = passwordValidator(11, 'Password is too short!');
    const form = createMargaritaForm({
      name: 'password-validator-test-form',
      initialValue: 'abc123ABC!@#def456DEF',
      validation: { required: false, password: customValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
});
