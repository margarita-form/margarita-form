import { createMargaritaForm } from '../../index';
import { colorValidator } from './color-validator';

const validator = colorValidator(true, 'Please enter a valid color');

describe('colorValidator', () => {
  it('should return valid for empty value when not required', async () => {
    const form = createMargaritaForm({
      name: 'color-validator-test-form',
      initialValue: undefined,
      validation: { required: false, color: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for "invalid value"', async () => {
    const form = createMargaritaForm({
      name: 'color-validator-test-form',
      initialValue: 'invalid value',
      validation: { required: false, color: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ color: 'Please enter a valid color' });
    form.cleanup();
  });
});
