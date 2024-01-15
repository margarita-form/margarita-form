import { nanoid } from 'nanoid';
import { FieldName, MFF, createMargaritaForm } from '../index';

describe('Functional name and fields', () => {
  it('should be able to create names that are strings', async () => {
    const form = createMargaritaForm({
      name: 'string-name-1',
      fields: [
        {
          name: 'string-name-2',
        },
      ],
    });

    expect(form.name).toBe('string-name-1');
    const stringName2Control = form.getControl('string-name-2');
    expect(stringName2Control).toBeDefined();
    expect(stringName2Control.name).toBe('string-name-2');
  });

  it('should be able to create names that are functions', async () => {
    const form = createMargaritaForm<MFF<{ name: FieldName }>>({
      name: () => 'function-name',
      fields: [
        {
          name: ({ parent }) => (parent ? parent.name + '-copied-name' : 'without-parent'),
        },
      ],
    });

    expect(form.name).toBe('function-name');
    const functionName2Control = form.getControl<any>('function-name-copied-name');
    expect(functionName2Control).toBeDefined();
    expect(functionName2Control.name).toBe('function-name-copied-name');
  });
  it('should be able to create fields that are functions', async () => {
    const rootId = nanoid();

    interface CustomField extends MFF {
      lorem: 'ipsum';
    }

    type RootField = MFF<{ fields: CustomField }>;

    const form = createMargaritaForm<RootField>({
      name: rootId,
      fields: [
        {
          name: 'basic-field',
          lorem: 'ipsum',
        },
        ({ parent }) => {
          if (!parent) throw 'Parent not defined';
          expect(parent.name).toBe(rootId);
          return {
            name: parent.name + '-functional-field',
            lorem: 'ipsum',
          };
        },
      ],
    });

    expect(form.name).toBeDefined();

    const basicFieldName1Control = form.getControl('basic-field');
    if (!basicFieldName1Control) throw 'basicFieldName1Control not defined';
    expect(basicFieldName1Control.name).toBe('basic-field');

    const childFieldName = rootId + '-functional-field';
    const functionalFieldName1Control = form.getControl(childFieldName);
    if (!functionalFieldName1Control) throw 'functionalFieldName1Control not defined';
    expect(functionalFieldName1Control.name).toBe(childFieldName);
  });
});
