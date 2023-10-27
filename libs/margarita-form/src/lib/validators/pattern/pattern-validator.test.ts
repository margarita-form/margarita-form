import { createMargaritaForm } from '../../create-margarita-form';
import { patternValidator } from './pattern-validator';

const helloalidator = patternValidator('hello', 'Please enter a string containing "hello"');
const onlyLettersValidator = patternValidator(/^[a-z]+$/, 'Please enter a string containing only lowercase letters');

describe('patternValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'pattern-validator-test-form',
      initialValue: undefined,
      validation: { required: false, pattern: helloalidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for matching string', async () => {
    const form = createMargaritaForm({
      name: 'pattern-validator-test-form',
      initialValue: 'hello',
      validation: { required: false, pattern: helloalidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for non-matching string', async () => {
    const form = createMargaritaForm({
      name: 'pattern-validator-test-form',
      initialValue: 'goodbye world',
      validation: { required: false, pattern: helloalidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ pattern: 'Please enter a string containing "hello"' });
    form.cleanup();
  });

  it('should return valid for matching regex', async () => {
    const form = createMargaritaForm({
      name: 'pattern-validator-test-form',
      initialValue: 'abcdefghijklmnopqrstuvwxyz',
      validation: { required: false, pattern: onlyLettersValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for non-matching regex', async () => {
    const form = createMargaritaForm({
      name: 'pattern-validator-test-form',
      initialValue: 'Hello World',
      validation: { required: false, pattern: onlyLettersValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ pattern: 'Please enter a string containing only lowercase letters' });
    form.cleanup();
  });
});
