import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../../index';

describe('Non existing validator testing', () => {
  console.warn = vitest.fn();
  it('should throw a warning if validation cannot resolve validator', async () => {
    console.warn = vitest.fn();
    const form = createMargaritaForm({
      name: nanoid(),
      validation: {
        nonExistingValidator: true,
      },
    });
    await form.validate();
    expect(console.warn).toHaveBeenCalled();
    expect(form.state.valid).toBe(true);
  });
});
