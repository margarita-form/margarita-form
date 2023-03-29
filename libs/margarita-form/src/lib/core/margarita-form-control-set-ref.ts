/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MargaritaFormControlTypes,
  MargaritaFormBaseElement,
  MargaritaFormField,
} from '../margarita-form-types';
import {
  connectNodeToControl,
  disconnectNodeFromControl,
} from './ref-helpers/margarita-form-ref-update-controls';
import { handleFormElementSubmit } from './ref-helpers/margarita-form-ref-form-submit';
import {
  handleControlDisable,
  handleElementBlur,
  handleElementFocus,
} from './ref-helpers/margarita-form-ref-state-changes';
import {
  setControlValueOnNodeValueChanges,
  setNodeValueOnControlValueChanges,
} from './ref-helpers/margarita-form-ref-value-changes';
import { setControlValidationFromNode } from './ref-helpers/margarita-form-ref-set-control-validation';

export const setRef = <F extends MargaritaFormField = MargaritaFormField>(
  node: MargaritaFormBaseElement<F> | null,
  control: MargaritaFormControlTypes<unknown, F>
): void => {
  if (!node) return;
  const alreadyIncluded = connectNodeToControl(node, control);
  if (!alreadyIncluded) {
    const params = { node, control };

    setControlValidationFromNode(params);

    const handleControlValueChange = setNodeValueOnControlValueChanges(params);
    const handleNodeValueChange = setControlValueOnNodeValueChanges(params);

    const handleDisable = handleControlDisable(params);
    const handleBlur = handleElementBlur(params);
    const handleFocus = handleElementFocus(params);
    const handleSubmit = handleFormElementSubmit(params);

    const mutationObserver = new MutationObserver((events) => {
      events.forEach((event) => {
        event.removedNodes.forEach((removedNode) => {
          if (removedNode === node) {
            disconnectNodeFromControl(params);
            handleControlValueChange?.unsubscribe();
            handleNodeValueChange?.unsubscribe();
            handleDisable?.unsubscribe();
            handleBlur?.unsubscribe();
            handleFocus?.unsubscribe();
            handleSubmit?.unsubscribe();

            mutationObserver.disconnect();
          }
        });
      });
    });

    if (node.parentNode) {
      mutationObserver.observe(node.parentNode, { childList: true });
    }
  }
};
