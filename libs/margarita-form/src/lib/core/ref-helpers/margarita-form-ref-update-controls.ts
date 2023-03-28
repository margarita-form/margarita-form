import type {
  MargaritaFormBaseElement,
  MargaritaFormControlTypes,
  MargaritaFormField,
} from '../../margarita-form-types';

const defineControlsToNode = <
  F extends MargaritaFormField = MargaritaFormField
>(
  node: MargaritaFormBaseElement<F>
) => {
  const nodeHasControls = node.controls;
  if (!nodeHasControls) {
    Object.defineProperty(node, 'controls', {
      value: [],
    });
  }
};

export const connectNodeToControl = <
  F extends MargaritaFormField = MargaritaFormField
>(
  node: MargaritaFormBaseElement<F>,
  control: MargaritaFormControlTypes<unknown, F>
) => {
  defineControlsToNode(node);

  const controlInNode = node.controls?.includes(control);
  if (!controlInNode) {
    node.controls?.push(control);
  }
  const nodeInControl = control.refs.includes(node);
  if (!nodeInControl) {
    control.refs.push(node);
  }
  const alreadyIncluded = controlInNode || nodeInControl;
  return alreadyIncluded;
};

export const disconnectNodeFromControl = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControlTypes<unknown, F>;
}) => {
  defineControlsToNode(node);

  const controlInNode = node.controls?.includes(control);
  if (controlInNode) {
    const { controls = [] } = node;
    const index = controls.findIndex((control) => control === this);
    if (index > -1) controls.splice(index, 1);
  }
  const nodeInControl = control.refs.includes(node);
  if (nodeInControl) {
    const { refs = [] } = control;
    const index = refs.findIndex((ref) => ref === node);
    if (index > -1) refs.splice(index, 1);
  }
};
