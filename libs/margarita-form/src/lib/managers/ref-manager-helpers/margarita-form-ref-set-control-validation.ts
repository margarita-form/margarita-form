import { MFC, MargaritaFormBaseElement, MargaritaFormFieldValidation } from '../../margarita-form-types';

export const setControlValidationFromNode = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  if (!control.config.detectInputElementValidations) return;
  if (!control.field.validation) control.field.validation = {};

  const validation = control.field.validation;

  const setValidation = (key: string, params: any) => (validation[key] = params);

  /* Required */
  if (!validation['required'] && node.required) {
    setValidation('required', true);
  }

  /* Pattern */
  if (!validation['pattern'] && node.pattern) {
    setValidation('pattern', node.pattern);
  }

  /* By node type */
  const inputTypes = ['email', 'tel', 'color', 'date', 'number', 'url', 'password'];
  if (node.type && inputTypes.includes(node.type)) {
    if (!validation[node.type]) setValidation(node.type, true);
  }
};
