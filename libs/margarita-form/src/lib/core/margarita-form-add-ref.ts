/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromEvent } from 'rxjs';
import { MargaritaFormControl } from '../margarita-form-control';
import { MargaritaFormGroup } from '../margarita-form-control-group';
import {
  MargaritaFormControlTypes,
  MargaritaFormBaseElement,
} from '../margarita-form-types';

export const addRef = (
  node: MargaritaFormBaseElement,
  control: MargaritaFormControlTypes<unknown>
): void => {
  if (!node) return;
  const type = node.type || node.nodeName;
  const multiple = node.multiple;
  const nodeHasControls = node.controls;
  if (!nodeHasControls) {
    Object.defineProperty(node, 'controls', {
      value: [],
    });
    return addRef(node, control);
  }

  const controlInNode = node.controls?.includes(control as any);
  if (!controlInNode) {
    node.controls?.push(control as any);
  }

  const alreadyIncluded = control.refs.includes(node);
  if (!alreadyIncluded) {
    control.refs.push(node);

    const handleSetValue = control.valueChanges.subscribe((value) => {
      try {
        if (type === 'checkbox') {
          if (multiple) {
            //
          } else if (control.refs.length > 1) {
            console.warn('Applying checked to multiple fields!');
            node.checked = Boolean(value);
          }
        } else if ('value' in node) {
          if (control instanceof MargaritaFormControl) {
            node.value = value || '';
          }
          if (control instanceof MargaritaFormGroup) {
            node.value = JSON.stringify(control.value, null, 2);
          }
        }
      } catch (error) {
        //
      }
    });

    const handleChange = fromEvent<InputEvent>(node, 'input').subscribe(() => {
      try {
        const getNodeValue = () => {
          if (type === 'checkbox') {
            if (multiple) {
              const isDefaultValue = /on|off/gi.test(String(node.value));
              if (isDefaultValue) {
                console.warn('No value available for checkbox!', { node });
              }

              const value = node.checked && node.value;
              const current: unknown[] = (control.value as any) || [];

              if (value) {
                return [...current, value];
              }
              return current.filter((val) => val !== node.value);
            }
            return node.checked;
          }
          if (node.value) return node.value;
          return undefined;
        };

        const value = getNodeValue();

        if (value !== undefined) {
          if (control instanceof MargaritaFormControl) {
            return control.setValue(value);
          }

          if (control instanceof MargaritaFormGroup) {
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

    const handleBlur = fromEvent<InputEvent>(node, 'blur').subscribe(() => {
      control.updateStateValue('touched', true);
      control.updateStateValue('focus', false);
    });

    const handleFocus = fromEvent<InputEvent>(node, 'focus').subscribe(() => {
      control.updateStateValue('focus', true);
    });

    const mutationObserver = new MutationObserver((events) => {
      events.forEach((event) => {
        event.removedNodes.forEach((removedNode) => {
          if (removedNode === node) {
            handleSetValue.unsubscribe();
            handleChange.unsubscribe();
            handleBlur.unsubscribe();
            handleFocus.unsubscribe();
            mutationObserver.disconnect();
            control.refs = control.refs.filter((ref) => ref !== node);
          }
        });
      });
    });

    if (node.parentNode) {
      mutationObserver.observe(node.parentNode, { childList: true });
    }
  }
};
