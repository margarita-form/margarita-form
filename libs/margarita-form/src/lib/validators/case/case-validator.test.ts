import { createMargaritaForm } from '../../../index';
import { caseValidator } from './case-validator';

const camelValidator = caseValidator('camel', 'Value must be in camel case');
const snakeValidator = caseValidator('snake', 'Value must be in snake case');
const kebabValidator = caseValidator('kebab', 'Value must be in kebab case');
const invalidValidator = caseValidator('invalid' as any);

describe('caseValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'case-validator-test-form',
      initialValue: undefined,
      validation: { required: false, case: camelValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return valid for correct camel case value', async () => {
    const form = createMargaritaForm({
      name: 'case-validator-test-form',
      initialValue: 'helloWorld',
      validation: { required: false, case: camelValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for incorrect camel case value', async () => {
    const form = createMargaritaForm({
      name: 'case-validator-test-form',
      initialValue: 'hello-world',
      validation: { required: false, case: camelValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ case: 'Value must be in camel case' });
    form.cleanup();
  });

  it('should return valid for correct snake case value', async () => {
    const form = createMargaritaForm({
      name: 'case-validator-test-form',
      initialValue: 'hello_world',
      validation: { required: false, case: snakeValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for incorrect snake case value', async () => {
    const form = createMargaritaForm({
      name: 'case-validator-test-form',
      initialValue: 'helloWorld',
      validation: { required: false, case: snakeValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ case: 'Value must be in snake case' });
    form.cleanup();
  });

  it('should return valid for correct kebab case value', async () => {
    const form = createMargaritaForm({
      name: 'case-validator-test-form',
      initialValue: 'hello-world',
      validation: { required: false, case: kebabValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for incorrect kebab case value', async () => {
    const form = createMargaritaForm({
      name: 'case-validator-test-form',
      initialValue: 'helloWorld',
      validation: { required: false, case: kebabValidator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(false);
    expect(errors).toEqual({ case: 'Value must be in kebab case' });
    form.cleanup();
  });

  it('should throw error for invalid case type', async () => {
    const createForm = () =>
      createMargaritaForm({
        name: 'case-validator-test-form',
        initialValue: 'helloWorld',
        validation: { required: false, case: invalidValidator },
      });
    expect(createForm).toThrowError('Invalid case type. Case must be one of: camel, snake, kebab');
  });
});
