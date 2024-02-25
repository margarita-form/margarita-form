import { nanoid } from 'nanoid';
import { createMargaritaForm } from '../index';

describe('Get controls', () => {
  it('should be able to dispatch action', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        {
          name: 'defaultField',
        },
        {
          name: 'activeField',
          active: true,
        },
        {
          name: 'inactiveField',
          active: false,
        },
        {
          name: 'visibleField',
          visible: true,
        },
        {
          name: 'invisibleField',
          visible: false,
        },
        {
          name: 'disabledField',
          disabled: true,
        },
        {
          name: 'enabledField',
          disabled: false,
        },
      ],
    });

    const allControls = form.getControls();
    expect(allControls.length).toEqual(7);

    const activeControls = form.getControls('active');
    expect(activeControls.length).toEqual(6);

    const activeControls2 = form.activeControls;
    expect(activeControls2.length).toEqual(6);

    const inactiveControls = form.getControls('inactive');
    expect(inactiveControls.length).toEqual(1);

    const visibleControls = form.getControls('visible');
    expect(visibleControls.length).toEqual(6);

    const visibleControls2 = form.visibleControls;
    expect(visibleControls2.length).toEqual(6);

    const invisibleControls = form.getControls('hidden');
    expect(invisibleControls.length).toEqual(1);

    const disabledControls = form.getControls('disabled');
    expect(disabledControls.length).toEqual(1);

    const enabledControls = form.getControls('enabled');
    expect(enabledControls.length).toEqual(6);

    const activeVisibleControls = form.getControls(['active', 'visible']);
    expect(activeVisibleControls.length).toEqual(5);

    const activeInvisibleControls = form.getControls(['active', 'hidden']);
    expect(activeInvisibleControls.length).toEqual(1);

    const disabledVisibleControls = form.getControls(['disabled', 'visible']);
    expect(disabledVisibleControls.length).toEqual(1);
  });
});
