import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../';

describe('Sibling getters', () => {
  it('should be able to get sibling controls', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        {
          name: 'field1',
        },
        {
          name: 'field2',
          active: false,
        },
        {
          name: 'field3',
        },
      ],
    });

    const field1Control = form.getControl('field1');
    expect(field1Control).toBeDefined();
    if (!field1Control) throw new Error('field1Control not found');

    const field2Control = field1Control.getSibling('field2');
    expect(field2Control).toBeDefined();
    if (!field2Control) throw new Error('field2Control not found');

    const field3Control = field2Control.getSibling('field3');
    expect(field3Control).toBeDefined();
    if (!field3Control) throw new Error('field3Control not found');

    const allSiblings = field1Control.getSiblings();
    expect(allSiblings).toHaveLength(2);
    expect(allSiblings[0].name).toBe('field2');
    expect(allSiblings[1].name).toBe('field3');

    const activeSiblings = field1Control.getActiveSiblings();
    expect(activeSiblings).toHaveLength(1);
    expect(activeSiblings[0].name).toBe('field3');
  });
});
