import { createMargaritaForm } from '../../create-margarita-form';
import { dateValidator } from './date-validator';

const validator = dateValidator(true, 'Please enter a valid date');

describe('dateValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'date-validator-test-form',
      initialValue: undefined,
      validation: { required: false, date: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return valid for valid date', async () => {
    const form = createMargaritaForm({
      name: 'date-validator-test-form',
      initialValue: new Date(),
      validation: { required: false, date: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });
  it('should return invalid for invalid date', async () => {
    const form = createMargaritaForm({
      name: 'date-validator-test-form',
      initialValue: 'invalid date',
      validation: { required: false, date: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ date: 'Please enter a valid date' });
    form.cleanup();
  });
});
