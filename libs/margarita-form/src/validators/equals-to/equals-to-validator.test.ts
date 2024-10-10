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

  it('should return valid for true value', async () => {
    const trueValidator = equalsToValidator(true);
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: true,
      validation: { required: false, equalsTo: trueValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for false value', async () => {
    const falseValidator = equalsToValidator(false);
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: false,
      validation: { required: false, equalsTo: falseValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for false value when true is expected', async () => {
    const trueValidator = equalsToValidator(true);
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: false,
      validation: { required: false, equalsTo: trueValidator },
    });
    await form.validate();
    const { valid } = form.state;
    expect(valid).toBe(false);
    form.cleanup();
  });

  it('should return valid for zero value', async () => {
    const zeroValidator = equalsToValidator(0);
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: 0,
      validation: { required: false, equalsTo: zeroValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for zero value when one is expected', async () => {
    const oneValidator = equalsToValidator(1);
    const form = createMargaritaForm({
      name: 'equals-to-validator-test-form',
      initialValue: 0,
      validation: { required: false, equalsTo: oneValidator },
    });
    await form.validate();
    const { valid } = form.state;
    expect(valid).toBe(false);
    form.cleanup();
  });
});
