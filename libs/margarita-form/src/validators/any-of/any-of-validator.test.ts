import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../../index';
import { anyOfValidator } from './any-of-validator';

const validator = anyOfValidator(['red', 'green', 'blue'], 'Please enter a valid color');

describe('anyOfValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
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
      name: nanoid(),
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
      name: nanoid(),
      initialValue: 'yellow',
      validation: { required: false, anyOf: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ anyOf: 'Please enter a valid color' });
    form.cleanup();
  });

  it('should return valid for true value', async () => {
    const trueValidator = anyOfValidator([true]);
    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: true,
      validation: { required: false, anyOf: trueValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for false value', async () => {
    const falseValidator = anyOfValidator([false]);
    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: false,
      validation: { required: false, anyOf: falseValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for false value when true is expected', async () => {
    const trueValidator = anyOfValidator([true]);
    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: false,
      validation: { required: false, anyOf: trueValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ anyOf: 'Value does not match any of the required values!' });
    form.cleanup();
  });

  it('should return valid for zero value', async () => {
    const zeroValidator = anyOfValidator([0]);
    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: 0,
      validation: { required: false, anyOf: zeroValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for zero value when one is expected', async () => {
    const oneValidator = anyOfValidator([1]);
    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: 0,
      validation: { required: false, anyOf: oneValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ anyOf: 'Value does not match any of the required values!' });
    form.cleanup();
  });
});
