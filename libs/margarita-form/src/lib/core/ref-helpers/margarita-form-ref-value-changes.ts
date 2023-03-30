import { fromEvent } from 'rxjs';
import { MargaritaFormValueControl } from '../../margarita-form-value-control';
import { MargaritaFormGroupControl } from '../../margarita-form-group-control';
import {
  MargaritaFormBaseElement,
  MargaritaFormControl,
  MargaritaFormField,
} from '../../margarita-form-types';

export const setNodeValueOnControlValueChanges = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
}) => {
  const type = node.type || node.nodeName;
  const multiple = node.multiple;
  return control.valueChanges.subscribe((value) => {
    try {
      if (type === 'checkbox') {
        if (multiple) {
          //
        } else if (control.refs.length > 1) {
          console.warn('Applying checked to multiple fields!');
          node.checked = Boolean(value);
        }
      } else if ('value' in node) {
        if (control instanceof MargaritaFormValueControl) {
          node.value = value || '';
        }
        if (control instanceof MargaritaFormGroupControl) {
          node.value = JSON.stringify(control.value, null, 2);
        }
      }
    } catch (error) {
      //
    }
  });
};

export const setControlValueOnNodeValueChanges = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
}) => {
  const type = node.type || node.nodeName;
  const multiple = node.multiple;

  return fromEvent<InputEvent>(node, 'input').subscribe(() => {
    try {
      const getNodeValue = () => {
        if (type === 'checkbox') {
          if (multiple) {
            const isDefaultValue = /on|off/gi.test(String(node.value));
            if (isDefaultValue) {
              console.warn('No value available for checkbox!', { node });
            }

            const value = node.checked && node.value;
            const current: unknown[] = (control.value as unknown[]) || [];

            if (value) {
              return [...current, value];
            }
            return current.filter((val) => val !== node.value);
          }
          return node.checked;
        }
        if (node.value !== undefined) return node.value;
        return undefined;
      };

      const value = getNodeValue();

      if (value !== undefined) {
        if (control instanceof MargaritaFormValueControl) {
          return control.setValue(value);
        }

        if (control instanceof MargaritaFormGroupControl) {
          if (typeof value === 'string') {
            const object = JSON.parse(value);
            return control.setValue(object);
          }
          if (typeof value === 'object') {
            return control.setValue(value);
          }
        }
      }
    } catch (error) {
      //
    }
  });
};
