import { createMargaritaForm } from '../../create-margarita-form';
import { urlValidator } from './url-validator';

const validator = urlValidator(true, 'Please enter a valid url');

describe('urlValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'url-validator-test-form',
      initialValue: undefined,
      validation: { required: false, url: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for valid url', async () => {
    const form = createMargaritaForm({
      name: 'url-validator-test-form',
      initialValue: 'https://www.google.com',
      validation: { required: false, url: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for invalid url', async () => {
    const form = createMargaritaForm({
      name: 'url-validator-test-form',
      initialValue: 'invalid url',
      validation: { required: false, url: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ url: 'Please enter a valid url' });
    form.cleanup();
  });
});
