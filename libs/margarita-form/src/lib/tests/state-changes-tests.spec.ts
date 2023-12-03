import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../../index';

describe('State changes testing', () => {
  it('onSubmit should trigger only after submit has happened', async () => {
    let eventTriggered = false;

    const form = createMargaritaForm({
      name: 'initial-value-matching',
      handleSubmit: () => true,
      fields: [
        {
          name: 'a',
          initialValue: true,
        },
      ],
    });

    expect(eventTriggered).toBe(false);
    expect(form.state.valid).toBe(true);
    expect(form.state.submits).toBe(0);

    const sub = form.onSubmit.subscribe(() => {
      eventTriggered = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for subscription to be triggered if it does

    expect(eventTriggered).toBe(false);

    await form.submit();

    expect(form.state.submits).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for subscription to be triggered if it does

    expect(eventTriggered).toBe(true);

    sub.unsubscribe();
    form.cleanup();
  });

  it('user defined active states should initally result to false when form is created', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      active: async () => true,
    });

    expect(form.state.active).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(form.state.active).toBe(true);

    form.cleanup();
  });
});
