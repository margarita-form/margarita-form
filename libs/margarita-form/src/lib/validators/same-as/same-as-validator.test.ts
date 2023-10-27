import { createMargaritaForm } from '../../create-margarita-form';
import { sameAsValidator } from './same-as-validator';

const validator = sameAsValidator('passwordConfirmation', 'Passwords do not match');

describe('sameAsValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'same-as-validator-test-form',
      initialValue: { password: '', passwordConfirmation: '' },
      fields: [
        {
          name: 'password',
        },
        {
          name: 'passwordConfirmation',
          validation: { sameAs: validator },
        },
      ],
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for matching values', async () => {
    const form = createMargaritaForm({
      name: 'same-as-validator-test-form',
      initialValue: { password: 'password', passwordConfirmation: 'password' },
      fields: [
        {
          name: 'password',
        },
        {
          name: 'passwordConfirmation',
          validation: { sameAs: validator },
        },
      ],
    });
    await form.validate();
    const { valid, allErrors } = form.state;
    expect(valid).toBe(true);
    expect(allErrors).toEqual([]);
    form.cleanup();
  });

  it('should return invalid for non-matching values', async () => {
    const form = createMargaritaForm({
      name: 'same-as-validator-test-form',
      initialValue: { password: 'password', passwordConfirmation: 'invalid' },
      fields: [
        {
          name: 'password',
        },
        {
          name: 'passwordConfirmation',
          validation: { sameAs: validator },
        },
      ],
    });
    await form.validate();
    const { valid, allErrors } = form.state;
    expect(valid).toBe(false);
    expect(allErrors[0].errors).toEqual({ sameAs: 'Passwords do not match' });
    form.cleanup();
  });
});
