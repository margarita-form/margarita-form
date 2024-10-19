import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';

describe('Current ref testing', () => {
  it('expect current ref to exists', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
    });

    const fakeElement = document.createElement('div');

    form.setRef(fakeElement);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const currentRef = form.currentRef;
    expect(currentRef).toBe(fakeElement);
    expect(currentRef?.nodeName).toBe('DIV');
  });
  it('expect current ref to fail if multiple refs are set', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
    });

    const fakeElement = document.createElement('div');

    form.setRef(fakeElement);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const currentRef = form.currentRef;
    expect(currentRef).toBe(fakeElement);

    const fakeElement2 = document.createElement('div');
    form.setRef(fakeElement2);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(() => form.currentRef).toThrowError('Cannot get current ref when multiple refs are set');
  });
});
