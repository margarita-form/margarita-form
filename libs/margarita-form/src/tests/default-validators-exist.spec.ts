import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';

describe('Validator testing', () => {
  it('expect default validators to exist and non required ones do not ', () => {
    const form = createMargaritaForm({
      name: nanoid(),
    });
    expect(form.validators).toHaveProperty('case');
    expect(form.validators).toHaveProperty('date');
    expect(form.validators).toHaveProperty('email');
    expect(form.validators).toHaveProperty('equalsTo');
    expect(form.validators).toHaveProperty('max');
    expect(form.validators).toHaveProperty('min');
    expect(form.validators).toHaveProperty('controlNameCase');
    expect(form.validators).toHaveProperty('number');
    expect(form.validators).toHaveProperty('password');
    expect(form.validators).toHaveProperty('pattern');
    expect(form.validators).toHaveProperty('phone');
    expect(form.validators).toHaveProperty('tel');
    expect(form.validators).toHaveProperty('required');
    expect(form.validators).toHaveProperty('typeof');
    expect(form.validators).toHaveProperty('url');

    expect(form.validators).not.toHaveProperty('anyOf');
    expect(form.validators).not.toHaveProperty('and');
    expect(form.validators).not.toHaveProperty('anyOf');
    expect(form.validators).not.toHaveProperty('color');
    expect(form.validators).not.toHaveProperty('integer');
    expect(form.validators).not.toHaveProperty('float');
    expect(form.validators).not.toHaveProperty('positiveNumber');
    expect(form.validators).not.toHaveProperty('negativeNumber');
    expect(form.validators).not.toHaveProperty('or');
    expect(form.validators).not.toHaveProperty('sameAs');
    expect(form.validators).not.toHaveProperty('slug');
    expect(form.validators).not.toHaveProperty('unique');
    expect(form.validators).not.toHaveProperty('yup');
    expect(form.validators).not.toHaveProperty('zod');
  });
});
