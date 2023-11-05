import { createMargaritaForm } from '../../index';

describe('State testing', () => {
  it('control visible states should be able to check sibling value', () => {
    const form = createMargaritaForm({
      name: 'initial-value-matching',
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
});
