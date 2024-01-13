import { ExtensionName, MFC, MFF, MFGF } from '../../typings/margarita-form-types';
import { ExtensionBase } from '../base/extension-base';
import { FieldModifier } from './field-modifiers-types';

export class FieldModifiersExtension extends ExtensionBase {
  public static override extensionName: ExtensionName = 'fieldModifiers';
  constructor(public override root: MFC) {
    super(root);
  }

  private mapModifiers = (field: MFF, parent?: MFC) => {
    let rootFound = false;
    const modifiers = new Set<FieldModifier>(field.fieldModifiers);
    while (!rootFound && parent) {
      const { fieldModifiers } = parent.field;
      if (fieldModifiers) fieldModifiers.forEach((m) => modifiers.add(m));
      if (!parent.isRoot) {
        parent = parent.parent;
      } else {
        rootFound = true;
        break;
      }
    }
    return [...modifiers];
  };

  public override modifyField = (field: MFF, parent?: MFC): MFGF => {
    const modifiers = this.mapModifiers(field, parent);
    if (!modifiers) return field;
    const activeModifiers = modifiers.filter((modifier) => {
      if (typeof modifier === 'function') return true;
      return modifier.condition({ field, parent });
    });
    return activeModifiers.reduce((field, modifier) => {
      if (typeof modifier === 'function') return modifier({ field, parent });
      return modifier.modifier({ field, parent });
    }, field);
  };
}
