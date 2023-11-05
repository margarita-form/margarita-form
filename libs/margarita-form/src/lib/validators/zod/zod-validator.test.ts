import { createMargaritaForm } from '../../../index';
import { z } from 'zod';
import { zodValidator } from './zod-validator';

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const validator = zodValidator(schema, 'Value must match the schema!');

describe('zodValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'zod-validator-test-form',
      initialValue: undefined,
      validation: { zod: validator },
    });
    await form.validate();
    const { valid } = form.state;
    expect(valid).toBe(false);
    form.cleanup();
  });

  it('should return valid for valid value', async () => {
    const form = createMargaritaForm({
      name: 'zod-validator-test-form',
      initialValue: { name: 'John', age: 30 },
      validation: { zod: validator },
    });
    await form.validate();
    const { valid, errors } = form.state;
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    form.cleanup();
  });

  it('should return invalid for invalid value', async () => {
    const form = createMargaritaForm({
      name: 'zod-validator-test-form',
      initialValue: { name: 'John', age: '30' },
      validation: { zod: validator },
    });
    await form.validate();
    const { valid } = form.state;
    expect(valid).toBe(false);
    form.cleanup();
  });
});
