import { fromEvent } from 'rxjs';
import { MFC, MargaritaFormBaseElement } from '../../typings/margarita-form-types';

export const setNodeValueOnControlValueChanges = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  const type = node.type || node.nodeName;
  const multiple = node.multiple;

  const setNodeValue = (value: CONTROL['value']) => {
    try {
      if (['checkbox', 'radio'].includes(type)) {
        const valueIsArray = Array.isArray(control.value);
        if (multiple && valueIsArray) {
          node.checked = value.includes(node.value);
        } else if (node.value === value) {
          node.checked = true;
        } else if (typeof value === 'boolean') {
          node.checked = value;
        } else if (value === undefined) {
          node.checked = false;
        }
      } else if ('value' in node) {
        if (typeof value === 'object') {
          node.value = JSON.stringify(control.value, null, 2);
        } else {
          node.value = value || '';
        }
      }
    } catch (error) {
      //
    }
  };
  setNodeValue(control.value);
  return control.valueChanges.subscribe(setNodeValue);
};

export const setControlValueOnNodeValueChanges = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  const type = node.type || node.nodeName;
  const multiple = node.multiple;

  return fromEvent<InputEvent>(node, 'input').subscribe(() => {
    try {
      const getNodeValue = () => {
        if (type === 'file' && node.files) {
          return node.files;
        }

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
        if (node.value !== undefined) {
          if (node.type === 'number') {
            return Number(node.value);
          }
          return node.value;
        }
        return undefined;
      };

      const value = getNodeValue();

      if (value !== undefined) {
        if (control.hasControls && typeof value === 'string') {
          const object = JSON.parse(value);
          return control.setValue(object);
        }
        return control.setValue(value);
      }
    } catch (error) {
      console.error(error);
    }
  });
};
