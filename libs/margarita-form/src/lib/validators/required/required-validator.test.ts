import { createMargaritaForm } from '../../create-margarita-form';
import { requiredValidator } from './required-validator';

describe('requiredValidator', () => {
  it('should return invalid for undefined value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: undefined,
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });

  it('should return invalid for null value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: null,
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });

  it('should return invalid for NaN value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: NaN,
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });

  it('should return invalid for Infinity value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: Infinity,
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });

  it('should return invalid for empty string value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: '',
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });

  it('should return invalid for empty array value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: [],
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });

  it('should return invalid for empty object value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: {},
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ required: 'This field is required!' });
    form.cleanup();
  });

  it('should return valid for 0 value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: 0,
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for false value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: false,
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for non-empty string value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: 'hello',
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for non-empty array value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: [1, 2, 3],
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for non-empty object value', async () => {
    const form = createMargaritaForm({
      name: 'required-validator-test-form',
      initialValue: { a: 1, b: 2 },
      validation: { required: requiredValidator() },
    });
    await form.validate();
    const { valid, errors } = form.state;

    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
});
