import { MFC, MargaritaFormBaseElement } from '../../margarita-form-types';

export const setControlValidationFromNode = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  const { appendNodeValidationsToControl, appendControlValidationsToNode, resolveNodeTypeValidationsToControl } = control.config;
  if (!appendNodeValidationsToControl && !appendControlValidationsToNode) return;
  if (!control.field.validation) control.field.validation = {};

  const validation = control.field.validation;

  const setControlValidation = (key: string, params: any) => {
    if (appendNodeValidationsToControl) validation[key] = params;
  };
  const setNodeValidation = (key: keyof typeof node, params: any) => {
    const { tagName, type, multiple } = node;
    const disallowAddition = tagName !== 'SELECT' && type !== 'file' && type !== 'email' && multiple;
    if (appendControlValidationsToNode && !disallowAddition) (node as any)[key] = params;
  };

  /* Required */
  if (!validation['required'] && node.required) {
    setControlValidation('required', true);
  } else if (validation['required'] && !node.required) {
    if (typeof validation['required'] !== 'function') {
      setNodeValidation('required', true);
    }
  }

  /* Pattern */
  if (!validation['pattern'] && node.pattern) {
    setControlValidation('pattern', node.pattern);
  } else if (validation['pattern'] && !node.pattern) {
    if (typeof validation['pattern'] === 'string' || validation['pattern'] instanceof RegExp) {
      const value = new RegExp(validation['pattern']).toString();
      setNodeValidation('pattern', value);
    }
  }

  /* By node type */
  if (resolveNodeTypeValidationsToControl) {
    const inputTypes = ['email', 'tel', 'color', 'date', 'number', 'url', 'password'];
    if (node.type && inputTypes.includes(node.type)) {
      if (!validation[node.type]) setControlValidation(node.type, true);
    }
  }
};
