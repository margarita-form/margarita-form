import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';
import { of } from 'rxjs';

describe('Dispatcher', () => {
  it('should be able to dispatch action', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      dispatcher: ({ action }) => action,
    });

    expect(form.value).toEqual(undefined);
    await form.dispatch('action-name');
    expect(form.value).toEqual('action-name');
  });

  it('should be able to dispatch action that conditionally updates value', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      dispatcher: ({ action }) => {
        if (action === 'action-name') return 1;
        return 0;
      },
    });

    expect(form.value).toEqual(undefined);
    await form.dispatch('action-name');
    expect(form.value).toEqual(1);
    await form.dispatch('another-action-name');
    expect(form.value).toEqual(0);
  });

  it('should be able to dispatch action that increments or decrements value', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: 0,
      dispatcher: ({ action, value }) => {
        if (action === 'increment') return value + 1;
        if (action === 'decrement') return value - 1;
        return value;
      },
    });

    expect(form.value).toEqual(0);
    await form.dispatch('increment');
    expect(form.value).toEqual(1);
    await form.dispatch('increment');
    expect(form.value).toEqual(2);
    await form.dispatch('decrement');
    expect(form.value).toEqual(1);
  });

  it('should be able to dispatch action that resolves promise', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      dispatcher: ({ action }) => Promise.resolve(action),
    });

    expect(form.value).toEqual(undefined);
    await form.dispatch('action-name');
    expect(form.value).toEqual('action-name');
  });

  it('should be able to dispatch action that resolves observable', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      dispatcher: ({ action }) => of(action),
    });

    expect(form.value).toEqual(undefined);
    await form.dispatch('action-name');
    expect(form.value).toEqual('action-name');
  });

  it('should be able to dispatch action that uses common resolver', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      dispatcher: 'calculator',
      initialValue: 0,
      resolvers: {
        calculator: ({ action, value }) => {
          if (action === 'increment') return value + 1;
          if (action === 'decrement') return value - 1;
          return value;
        },
      },
    });

    expect(form.value).toEqual(0);
    await form.dispatch('increment');
    expect(form.value).toEqual(1);
    await form.dispatch('increment');
    expect(form.value).toEqual(2);
    await form.dispatch('decrement');
    expect(form.value).toEqual(1);
  });
});
