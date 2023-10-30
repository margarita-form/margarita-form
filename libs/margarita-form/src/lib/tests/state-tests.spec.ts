import { createMargaritaForm } from '../create-margarita-form';

describe('State testing', () => {
  it('should allow visible to be true if sibling value equals 1', () => {
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
      ],
    });

    const bControl = form.getControl('b');
    expect(bControl.state.visible).toBe(true);
  });
});
