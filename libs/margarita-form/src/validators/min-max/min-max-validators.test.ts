import { createMargaritaForm } from '../../index';
import { maxValidator, minValidator } from './min-max-validators';

const _maxValidator = maxValidator(10, 'Value is too high!');
const _minValidator = minValidator(10, 'Value is too low!');

describe('maxValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'max-validator-test-form',
      initialValue: undefined,
      validation: { required: false, max: _maxValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for value less than max', async () => {
    const form = createMargaritaForm({
      name: 'max-validator-test-form',
      initialValue: 5,
      validation: { required: false, max: _maxValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for value greater than max', async () => {
    const form = createMargaritaForm({
      name: 'max-validator-test-form',
      initialValue: 15,
      validation: { required: false, max: _maxValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ max: 'Value is too high!' });
    form.cleanup();
  });
});

describe('minValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'min-validator-test-form',
      initialValue: undefined,
      validation: { required: false, min: _minValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for value greater than min', async () => {
    const form = createMargaritaForm({
      name: 'min-validator-test-form',
      initialValue: 15,
      validation: { required: false, min: _minValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for value less than min', async () => {
    const form = createMargaritaForm({
      name: 'min-validator-test-form',
      initialValue: 5,
      validation: { required: false, min: _minValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ min: 'Value is too low!' });
    form.cleanup();
  });
});
