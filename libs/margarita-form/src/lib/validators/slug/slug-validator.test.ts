import { createMargaritaForm } from '../../../index';
import { slugValidator } from './slug-validator';

const validator = slugValidator(true, 'Please enter a valid slug');

describe('slugValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'slug-validator-test-form',
      initialValue: undefined,
      validation: { required: false, slug: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for valid slug', async () => {
    const form = createMargaritaForm({
      name: 'slug-validator-test-form',
      initialValue: 'valid-slug',
      validation: { required: false, slug: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for invalid slug', async () => {
    const form = createMargaritaForm({
      name: 'slug-validator-test-form',
      initialValue: 'invalid slug',
      validation: { required: false, slug: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ slug: 'Please enter a valid slug' });
    form.cleanup();
  });
});
