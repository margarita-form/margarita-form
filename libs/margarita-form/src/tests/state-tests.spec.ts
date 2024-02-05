import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';

describe('State testing', () => {
  it('control visible states should be able to check sibling value', () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        {
          name: 'a',
          initialValue: true,
        },
        {
          name: 'b',
          visible: ({ control }) => {
            const sibling = control.parent.getControl('a');
            const exists = sibling && sibling.value;
            return Boolean(exists);
          },
        },
        {
          name: 'c',
          visible: ({ control }) => {
            const sibling = control.parent.getControl('a');
            const exists = sibling && sibling.value === true;
            return Boolean(exists);
          },
        },
        {
          name: 'd',
          visible: ({ control }) => {
            const sibling = control.parent.getControl('a');
            const exists = sibling && sibling.value === false;
            return Boolean(exists);
          },
        },
      ],
    });

    const bControl = form.getControl('b');
    expect(bControl.state.visible).toBe(true);
    const cControl = form.getControl('c');
    expect(cControl.state.visible).toBe(true);
    const dControl = form.getControl('d');
    expect(dControl.state.visible).toBe(false);
  });

  it('control parentIsActive states should be inherited', () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        {
          name: 'a',
          initialValue: true,
        },
      ],
    });

    expect(form.state.active).toBe(true);
    expect(form.state.parentIsActive).toBe(true);
    const aControl = form.getControl('a');
    if (!aControl) throw new Error('Control "a" not found');
    expect(aControl.state.active).toBe(true);
    expect(aControl.state.parentIsActive).toBe(true);

    form.updateStateValue('active', false);
    expect(form.state.active).toBe(false);
    expect(form.state.parentIsActive).toBe(false);
    expect(aControl.state.active).toBe(true);
    expect(aControl.state.parentIsActive).toBe(false);

    aControl.updateStateValue('active', false);
    expect(aControl.state.active).toBe(false);
    expect(aControl.state.parentIsActive).toBe(false);

    form.updateStateValue('active', true);
    expect(form.state.active).toBe(true);
    expect(form.state.parentIsActive).toBe(true);
    expect(aControl.state.active).toBe(false);
    expect(aControl.state.parentIsActive).toBe(true);
  });

  it('control focusWithin should be resolved', () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        // {
        //   name: 'a',
        // },
        {
          name: 'b',
          fields: [
            {
              name: 'c',
            },
          ],
        },
      ],
    });

    expect(form.state.focus).toBe(false);
    expect(form.state.focusWithin).toBe(false);
    form.updateStateValue('focus', true);
    expect(form.state.focus).toBe(true);
    expect(form.state.focusWithin).toBe(true);
    form.updateStateValue('focus', false);
    expect(form.state.focus).toBe(false);
    expect(form.state.focusWithin).toBe(false);

    // const aControl = form.getControl('a');
    // if (!aControl) throw new Error('Control "a" not found');
    // expect(aControl.state.focus).toBe(false);
    // expect(aControl.state.focusWithin).toBe(false);
    // aControl.updateStateValue('focus', true);
    // expect(aControl.state.focus).toBe(true);
    // expect(aControl.state.focusWithin).toBe(true);
    // expect(form.state.focus).toBe(false);
    // expect(form.state.focusWithin).toBe(true);
    // aControl.updateStateValue('focus', false);
    // expect(aControl.state.focus).toBe(false);
    // expect(aControl.state.focusWithin).toBe(false);
    // expect(form.state.focus).toBe(false);
    // expect(form.state.focusWithin).toBe(false);

    const bControl = form.getControl('b');
    if (!bControl) throw new Error('Control "b" not found');
    expect(bControl.state.focus).toBe(false);
    expect(bControl.state.focusWithin).toBe(false);

    const cControl = bControl.getControl('c');
    if (!cControl) throw new Error('Control "c" not found');
    expect(cControl.state.focus).toBe(false);
    expect(cControl.state.focusWithin).toBe(false);
    cControl.updateStateValue('focus', true);
    expect(cControl.state.focus).toBe(true);
    expect(cControl.state.focusWithin).toBe(true);
    expect(bControl.state.focus).toBe(false);
    expect(bControl.state.focusWithin).toBe(true);
    expect(form.state.focus).toBe(false);
    expect(form.state.focusWithin).toBe(true);
  });
});
