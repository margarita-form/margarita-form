import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../../index';
import '../../lib/validators/add-all-validators';

describe('All validator testing', () => {
  it('expect all validators to exist', () => {
    const form = createMargaritaForm({
      name: nanoid(),
    });
    expect(form.validators).toHaveProperty('and');
    expect(form.validators).toHaveProperty('anyOf');
    expect(form.validators).toHaveProperty('case');
    expect(form.validators).toHaveProperty('color');
    expect(form.validators).toHaveProperty('date');
    expect(form.validators).toHaveProperty('email');
    expect(form.validators).toHaveProperty('eaqualsTo');
    expect(form.validators).toHaveProperty('max');
    expect(form.validators).toHaveProperty('min');
    expect(form.validators).toHaveProperty('controlNameCase');
    expect(form.validators).toHaveProperty('number');
    expect(form.validators).toHaveProperty('integer');
    expect(form.validators).toHaveProperty('float');
    expect(form.validators).toHaveProperty('positiveNumber');
    expect(form.validators).toHaveProperty('negativeNumber');
    expect(form.validators).toHaveProperty('or');
    expect(form.validators).toHaveProperty('password');
    expect(form.validators).toHaveProperty('pattern');
    expect(form.validators).toHaveProperty('phone');
    expect(form.validators).toHaveProperty('tel');
    expect(form.validators).toHaveProperty('required');
    expect(form.validators).toHaveProperty('sameAs');
    expect(form.validators).toHaveProperty('slug');
    expect(form.validators).toHaveProperty('typeof');
    expect(form.validators).toHaveProperty('unique');
    expect(form.validators).toHaveProperty('url');
    expect(form.validators).toHaveProperty('yup');
    expect(form.validators).toHaveProperty('zod');
  });
});
