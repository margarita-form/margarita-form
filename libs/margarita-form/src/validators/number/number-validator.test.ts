import { createMargaritaForm } from '../../index';
import { numberValidator, integerValidator, floatValidator, positiveNumberValidator, negativeNumberValidator } from './number-validator';

const _numberValidator = numberValidator(true, 'Please enter a valid number');
const _integerValidator = integerValidator(true, 'Please enter a valid integer');
const _floatValidator = floatValidator(true, 'Please enter a valid float');
const _positiveNumberValidator = positiveNumberValidator(true, 'Please enter a positive number');
const _negativeNumberValidator = negativeNumberValidator(true, 'Please enter a negative number');

describe('numberValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'number-validator-test-form',
      initialValue: undefined,
      validation: { required: false, number: _numberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid number', async () => {
    const form = createMargaritaForm({
      name: 'number-validator-test-form',
      initialValue: 42,
      validation: { required: false, number: _numberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid number', async () => {
    const form = createMargaritaForm({
      name: 'number-validator-test-form',
      initialValue: 'invalid',
      validation: { required: false, number: _numberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ number: 'Please enter a valid number' });
    form.cleanup();
  });
});

describe('integerValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'integer-validator-test-form',
      initialValue: undefined,
      validation: { required: false, integer: _integerValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid integer', async () => {
    const form = createMargaritaForm({
      name: 'integer-validator-test-form',
      initialValue: 42,
      validation: { required: false, integer: _integerValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid integer', async () => {
    const form = createMargaritaForm({
      name: 'integer-validator-test-form',
      initialValue: 3.14,
      validation: { required: false, integer: _integerValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ integer: 'Please enter a valid integer' });
    form.cleanup();
  });
});

describe('floatValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'float-validator-test-form',
      initialValue: undefined,
      validation: { required: false, float: _floatValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid float', async () => {
    const form = createMargaritaForm({
      name: 'float-validator-test-form',
      initialValue: 3.14,
      validation: { required: false, float: _floatValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid float', async () => {
    const form = createMargaritaForm({
      name: 'float-validator-test-form',
      initialValue: 'invalid',
      validation: { required: false, float: _floatValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ float: 'Please enter a valid float' });
    form.cleanup();
  });
});

describe('positiveNumberValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'positive-number-validator-test-form',
      initialValue: undefined,
      validation: { required: false, positiveNumber: _positiveNumberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid positive number', async () => {
    const form = createMargaritaForm({
      name: 'positive-number-validator-test-form',
      initialValue: 42,
      validation: { required: false, positiveNumber: _positiveNumberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid positive number', async () => {
    const form = createMargaritaForm({
      name: 'positive-number-validator-test-form',
      initialValue: -42,
      validation: { required: false, positiveNumber: _positiveNumberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ positiveNumber: 'Please enter a positive number' });
    form.cleanup();
  });
});

describe('negativeNumberValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'negative-number-validator-test-form',
      initialValue: undefined,
      validation: { required: false, negativeNumber: _negativeNumberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid negative number', async () => {
    const form = createMargaritaForm({
      name: 'negative-number-validator-test-form',
      initialValue: -42,
      validation: { required: false, negativeNumber: _negativeNumberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid negative number', async () => {
    const form = createMargaritaForm({
      name: 'negative-number-validator-test-form',
      initialValue: 42,
      validation: { required: false, negativeNumber: _negativeNumberValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ negativeNumber: 'Please enter a negative number' });
    form.cleanup();
  });
});
