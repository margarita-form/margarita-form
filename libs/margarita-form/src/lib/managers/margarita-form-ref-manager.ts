import { BehaviorSubject } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MargaritaFormBaseElement } from '../margarita-form-types';
import { handleFormElementSubmit } from './ref-manager-helpers/margarita-form-ref-form-submit';
import { setControlValidationFromNode } from './ref-manager-helpers/margarita-form-ref-set-control-validation';
import {
  handleControlDisable,
  handleControlReadonly,
  handleElementBlur,
  handleElementFocus,
} from './ref-manager-helpers/margarita-form-ref-state-changes';
import {
  setNodeValueOnControlValueChanges,
  setControlValueOnNodeValueChanges,
} from './ref-manager-helpers/margarita-form-ref-value-changes';

class RefManager<CONTROL extends MFC> extends BaseManager {
  #refs: MargaritaFormBaseElement<CONTROL>[] = [];
  public changes = new BehaviorSubject<MargaritaFormBaseElement<CONTROL>[]>([]);

  constructor(public control: CONTROL) {
    super();

    this.onCleanup = () => {
      this.#refs.forEach((ref) => {
        if (!ref || !ref.controls) return;
        const { controls = [] } = ref;
        const index = controls.findIndex(
          (control) => control.key === this.control.key
        );
        if (index > -1) ref.controls.splice(index, 1);
      });
    };
  }

  #emitChanges() {
    this.changes.next(this.#refs);
  }

  public get refs(): MargaritaFormBaseElement<CONTROL>[] {
    return this.#refs;
  }

  public disconnectRef(
    node: MargaritaFormBaseElement<CONTROL['field']> | null
  ) {
    if (!node) return;
  }

  public addRef(node: MargaritaFormBaseElement<CONTROL> | null | undefined) {
    if (!node) return;
    const alreadyIncluded = this.#connectNodeToControl(node);
    if (alreadyIncluded) return;

    const params = { node, control: this.control };

    setControlValidationFromNode(params);

    const handleControlValueChange = setNodeValueOnControlValueChanges(params);
    const handleNodeValueChange = setControlValueOnNodeValueChanges(params);

    const handleDisable = handleControlDisable(params);
    const handleReadOnly = handleControlReadonly(params);
    const handleBlur = handleElementBlur(params);
    const handleFocus = handleElementFocus(params);
    const handleSubmit = handleFormElementSubmit(params);

    const mutationObserver = new MutationObserver((events) => {
      events.forEach((event) => {
        event.removedNodes.forEach((removedNode) => {
          if (removedNode === node) {
            this.#disconnectNodeFromControl(node);
            handleControlValueChange?.unsubscribe();
            handleNodeValueChange?.unsubscribe();
            handleDisable?.unsubscribe();
            handleReadOnly?.unsubscribe();
            handleBlur?.unsubscribe();
            handleFocus?.unsubscribe();
            handleSubmit?.unsubscribe();

            mutationObserver.disconnect();
            this.#emitChanges();
          }
        });
      });
    });

    if (node.parentNode) {
      mutationObserver.observe(node.parentNode, { childList: true });
    }

    this.#emitChanges();
  }

  #defineControlsToNode(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    const nodeHasControls = node.controls;
    if (!nodeHasControls) {
      Object.defineProperty(node, 'controls', {
        value: [],
      });
    }
  }

  #connectNodeToControl(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this.#defineControlsToNode(node);

    const controlInNode = node.controls?.includes(this.control);
    if (!controlInNode) {
      node.controls?.push(this.control);
    }
    const nodeInControl = this.refs.includes(node);
    if (!nodeInControl) {
      this.refs.push(node);
    }
    const alreadyIncluded = controlInNode || nodeInControl;
    return alreadyIncluded;
  }

  #disconnectNodeFromControl(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this.#defineControlsToNode(node);

    const controlInNode = node.controls?.includes(this.control);
    if (controlInNode) {
      const { controls = [] } = node;
      const index = controls.findIndex((control) => control === this.control);
      if (index > -1) controls.splice(index, 1);
    }
    const nodeInControl = this.refs.includes(node);
    if (nodeInControl) {
      const index = this.refs.findIndex((ref) => ref === node);
      if (index > -1) this.refs.splice(index, 1);
    }
  }
}

export { RefManager };
