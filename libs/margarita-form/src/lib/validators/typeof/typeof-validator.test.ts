import { createMargaritaForm } from '../../../index';
import { typeofValidator } from './typeof-validator';

describe('typeofValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: undefined,
      validation: { required: false, typeof: typeofValidator(undefined, 'Please enter a valid value!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for string value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: 'hello',
      validation: { required: false, typeof: typeofValidator('string', 'Please enter a valid string!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for number value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: 42,
      validation: { required: false, typeof: typeofValidator('number', 'Please enter a valid number!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for bigint value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: BigInt(42),
      validation: { required: false, typeof: typeofValidator('bigint', 'Please enter a valid bigint!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for boolean value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: true,
      validation: { required: false, typeof: typeofValidator('boolean', 'Please enter a valid boolean!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for symbol value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: Symbol('test'),
      validation: { required: false, typeof: typeofValidator('symbol', 'Please enter a valid symbol!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for undefined value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: undefined,
      validation: { required: false, typeof: typeofValidator('undefined', 'Please enter a valid undefined!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for null value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: null,
      validation: { required: false, typeof: typeofValidator('null', 'Please enter a valid null!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for object value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: { test: 'value' },
      validation: { required: false, typeof: typeofValidator('object', 'Please enter a valid object!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for function value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: () => 123,
      validation: { required: false, typeof: typeofValidator('function', 'Please enter a valid function!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for array value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: [1, 2, 3],
      validation: { required: false, typeof: typeofValidator('array', 'Please enter a valid array!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for map value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: new Map(),
      validation: { required: false, typeof: typeofValidator('map', 'Please enter a valid map!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for date value', async () => {
    const form = createMargaritaForm({
      name: 'typeof-validator-test-form',
      initialValue: new Date(),
      validation: { required: false, typeof: typeofValidator('date', 'Please enter a valid date!') },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
});
