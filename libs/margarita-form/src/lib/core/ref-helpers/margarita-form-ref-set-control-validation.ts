import {
  MargaritaFormBaseElement,
  MargaritaFormControl,
  MargaritaFormField,
  MargaritaFormFieldValidation,
} from '../../margarita-form-types';

export const setControlValidationFromNode = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
}) => {
  if (!control.field.validation) control.field.validation = {};

  const validation = control.field.validation as MargaritaFormFieldValidation;

  const setValidation = (key: string, params: unknown) =>
    (validation[key] = params);

  /* Required */
  if (!validation['required'] && node.required) {
    setValidation('required', true);
  }

  /* Pattern */
  if (!validation['pattern'] && node.pattern) {
    setValidation('pattern', node.pattern);
  }

  /* By node type */
  const inputTypes = ['email', 'tel', 'color', 'date', 'number', 'url'];
  if (node.type && inputTypes.includes(node.type)) {
    if (!validation[node.type]) setValidation(node.type, true);
  }
};
