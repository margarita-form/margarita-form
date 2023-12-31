import { nanoid } from 'nanoid';
import { MFGF, createMargaritaForm } from '../index';

describe('Start with', () => {
  it('should be able to have grouping to work as string', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      grouping: 'array',
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
    expect(form.grouping).toBe('array');
    expect(Array.isArray(form.controls)).toBe(true);
  });
  it('should be able to have grouping to work as function', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      grouping: () => 'array',
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
    expect(form.grouping).toBe('array');
    expect(Array.isArray(form.controls)).toBe(true);
  });
  it("should be able to have child control's grouping to work as function ", async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      fields: [
        {
          name: 'flat',
          grouping: () => 'flat',
          fields: [
            {
              name: 'name-1',
              initialValue: 'initial-value-1',
            },
            {
              name: 'name-2',
              initialValue: 'initial-value-2',
            },
          ],
        },
      ],
    });
    expect(form.grouping).toBe('group');
    expect(Array.isArray(form.controls)).toBe(true);

    const flatControl = form.getControl('flat');
    expect(flatControl).toBeDefined();
    expect(flatControl.grouping).toBe('flat');
    expect(flatControl.controls.length).toBe(2);

    expect(form.value).toEqual({
      'name-1': 'initial-value-1',
      'name-2': 'initial-value-2',
    });
  });
  it("should be able to have child control's grouping to work as function and be based on parent ", async () => {
    const rootField: Partial<MFGF> = {
      fields: [
        {
          name: 'flat',
          grouping: ({ parent }) => {
            if (!parent) throw 'Parent not defined';
            return parent?.field['shouldBeFlat'] === true ? 'flat' : 'group';
          },
          fields: [
            {
              name: 'name-1',
              initialValue: 'initial-value-1',
            },
            {
              name: 'name-2',
              initialValue: 'initial-value-2',
            },
          ],
        },
      ],
    };

    const form1 = createMargaritaForm({
      ...rootField,
      name: nanoid(),
      shouldBeFlat: true,
    });
    expect(form1.grouping).toBe('group');
    const flatControl1 = form1.getControl('flat');
    if (!flatControl1) throw 'Flat control not defined';
    expect(flatControl1.grouping).toBe('flat');
    expect(flatControl1.controls.length).toBe(2);

    expect(form1.value).toEqual({
      'name-1': 'initial-value-1',
      'name-2': 'initial-value-2',
    });

    const form2 = createMargaritaForm({
      ...rootField,
      name: nanoid(),
      shouldBeFlat: false,
    });
    expect(form2.grouping).toBe('group');
    const flatControl2 = form2.getControl('flat');
    if (!flatControl2) throw 'Flat control not defined';
    expect(flatControl2.grouping).toBe('group');
    expect(flatControl2.controls.length).toBe(2);

    expect(form2.value).toEqual({
      flat: {
        'name-1': 'initial-value-1',
        'name-2': 'initial-value-2',
      },
    });
  });
});
