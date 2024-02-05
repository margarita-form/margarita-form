import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';
import { HistoryExtension } from '../extensions/history/history-extension';

describe('history extension testing', () => {
  it('Check that history works correctly', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [{ name: 'a', initialValue: 123 }],
      extensions: [HistoryExtension],
    });

    expect(form.value).toEqual({ a: 123 });
    await new Promise((resolve) => setTimeout(resolve, 1250));
    form.setValue({ a: 456 });
    expect(form.value).toEqual({ a: 456 });
    await new Promise((resolve) => setTimeout(resolve, 1250));
    form.setValue({ a: 789 });
    expect(form.value).toEqual({ a: 789 });
    await new Promise((resolve) => setTimeout(resolve, 1250));
    form.undo();
    expect(form.value).toEqual({ a: 456 });
    form.undo();
    expect(form.value).toEqual({ a: 123 });
    form.redo();
    expect(form.value).toEqual({ a: 456 });
    form.redo();
    expect(form.value).toEqual({ a: 789 });
    form.undo();
    expect(form.value).toEqual({ a: 456 });

    form.setValue({ a: 123456789 });
    expect(form.value).toEqual({ a: 123456789 });
    await new Promise((resolve) => setTimeout(resolve, 750));

    form.undo();
    expect(form.value).toEqual({ a: 456 });
    form.redo();
    expect(form.value).toEqual({ a: 123456789 });
  });
});
