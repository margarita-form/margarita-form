/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromEvent } from 'rxjs';
import { MargaritaFormArray } from '../margarita-form-array';
import { MargaritaFormControl } from '../margarita-form-control';
import { MargaritaFormGroup } from '../margarita-form-group';
import {
  MargaritaFormControlTypes,
  MargaritaFormBaseElement,
} from '../margarita-form-types';

export const addRef = (
  node: MargaritaFormBaseElement,
  control: MargaritaFormControlTypes<unknown>
): void => {
  if (!node) return;
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
        if ('value' in node) {
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
        if ('value' in node) {
          if (control instanceof MargaritaFormControl) {
            control.setValue(node.value);
          }

          if (control instanceof MargaritaFormGroup) {
            if (typeof node.value === 'string') {
              const value = JSON.parse(node.value);
              control.setValue(value);
            }
            if (typeof node.value === 'object') {
              control.setValue(node.value);
            }
          }

          if (control instanceof MargaritaFormArray) {
            if (typeof node.value === 'string') {
              const value = JSON.parse(node.value);
              if (Array.isArray(value)) {
                control.setValue(value);
              }
            }
            if (typeof node.value === 'object' && Array.isArray(node.value)) {
              control.setValue(node.value);
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
            console.log('delete', control);
          }
        });
      });
    });

    if (node.parentNode) {
      mutationObserver.observe(node.parentNode, { childList: true });
    }
  }
};
