import type {
  MargaritaFormBaseElement,
  MargaritaFormControlTypes,
} from '../../margarita-form-types';

const defineControlsToNode = (node: MargaritaFormBaseElement) => {
  const nodeHasControls = node.controls;
  if (!nodeHasControls) {
    Object.defineProperty(node, 'controls', {
      value: [],
    });
  }
};

export const connectNodeToControl = (
  node: MargaritaFormBaseElement,
  control: MargaritaFormControlTypes
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

export const disconnectNodeFromControl = ({
  node,
  control,
}: {
  node: MargaritaFormBaseElement;
  control: MargaritaFormControlTypes;
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
