import { createMargaritaForm } from '../../../index';
import { uniqueValidator } from './unique-validator';

describe('uniqueValidator', () => {
  it('should return valid for empty value', async () => {
    const form = createMargaritaForm({
      name: 'unique-validator-test-form',
      initialValue: { field1: '1', field2: '2' },
      fields: [
        {
          name: 'field1',
        },
        {
          name: 'field2',
          validation: { unique: uniqueValidator(true, 'Fields must be unique') },
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
      name: 'unique-validator-test-form',
      initialValue: { field1: '1', field2: '1' },
      fields: [
        {
          name: 'field1',
        },
        {
          name: 'field2',
          validation: { unique: uniqueValidator(true, 'Fields must be unique') },
        },
      ],
    });
    await form.validate();
    const { valid, allErrors } = form.state;
    expect(valid).toBe(false);
    expect(allErrors[0].errors).toEqual({ unique: 'Fields must be unique' });
    form.cleanup();
  });

  it('should return valid for unique values when comparing specific fields', async () => {
    const form = createMargaritaForm({
      name: 'unique-validator-test-form',
      initialValue: { field1: '1', field2: '2', field3: '2' },
      fields: [
        {
          name: 'field1',
        },
        {
          name: 'field2',
          validation: { unique: uniqueValidator(['field1'], 'Fields must be unique') },
        },
        {
          name: 'field3',
        },
      ],
    });
    await form.validate();
    const { valid, allErrors } = form.state;
    expect(valid).toBe(true);
    expect(allErrors).toEqual([]);
    form.cleanup();
  });

  it('should return invalid for unique values when comparing specific fields', async () => {
    const form = createMargaritaForm({
      name: 'unique-validator-test-form',
      initialValue: { field1: '1', field2: '2', field3: '2' },
      fields: [
        {
          name: 'field1',
        },
        {
          name: 'field2',
          validation: { unique: uniqueValidator(['field3'], 'Fields must be unique') },
        },
        {
          name: 'field3',
        },
      ],
    });
    await form.validate();
    const { valid, allErrors } = form.state;
    expect(valid).toBe(false);
    expect(allErrors[0].errors).toEqual({ unique: 'Fields must be unique' });
    form.cleanup();
  });
});
