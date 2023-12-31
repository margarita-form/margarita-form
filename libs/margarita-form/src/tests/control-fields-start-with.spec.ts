import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';

describe('Start with', () => {
  it('should be able to have "startWith" as a function that returns a number', async () => {
    let length = 0;
    const form = createMargaritaForm({
      name: nanoid(),
      grouping: 'array',
      startWith: () => {
        length = Math.ceil(Math.random() * 10);
        return length;
      },
      fields: [
        {
          name: 'name',
        },
      ],
    });
    expect(form.controls.length).toBeGreaterThan(0);
    expect(form.controls.length).toBeLessThan(11);
    expect(form.controls.length).toBe(length);
  });

  it('should be able to have "startWith" as a function that returns array of strings with random length and every second name is different', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      grouping: 'array',
      startWith: () => {
        const length = Math.ceil(Math.random() * 10);
        const result = [];
        for (let i = 0; i < length; i++) {
          result.push(`name-${(i % 2) + 1}`);
        }
        return result;
      },
      fields: [
        {
          name: 'name-1',
        },
        {
          name: 'name-2',
        },
      ],
      config: {
        addMetadata: true,
      },
    });
    expect(form.controls.length).toBeGreaterThan(0);
    expect(form.controls.length).toBeLessThan(11);

    for (let i = 0; i < form.controls.length; i++) {
      const control = form.controls[i];
      if (control) expect(control.name).toBe(`name-${(i % 2) + 1}`);
    }
  });
});
