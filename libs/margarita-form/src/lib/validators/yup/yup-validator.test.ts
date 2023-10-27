import { createMargaritaForm } from '../../create-margarita-form';
import { yupValidator } from './yup-validator';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required().positive().integer(),
});

const validator = yupValidator(schema, 'Please enter a valid value');

describe('yupValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'yup-validator-test-form',
      initialValue: undefined,
      validation: { yup: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({
      yup: 'age is a required field',
    });
    form.cleanup();
  });

  it('should return valid for valid value', async () => {
    const form = createMargaritaForm({
      name: 'yup-validator-test-form',
      initialValue: { name: 'John Doe', age: 30 },
      validation: { yup: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for invalid value', async () => {
    const form = createMargaritaForm({
      name: 'yup-validator-test-form',
      initialValue: { name: 'John Doe', age: 'invalid' },
      validation: { yup: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ yup: 'age must be a `number` type, but the final value was: `NaN` (cast from the value `"invalid"`).' });
    form.cleanup();
  });
});
