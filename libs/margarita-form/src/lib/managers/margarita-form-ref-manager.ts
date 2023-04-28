import { BehaviorSubject } from 'rxjs';
import { BaseManager } from './margarita-form-base-manager';
import { MFC, MargaritaFormBaseElement } from '../margarita-form-types';
import { handleFormElementSubmit } from './ref-manager-helpers/margarita-form-ref-form-submit';
import { setControlValidationFromNode } from './ref-manager-helpers/margarita-form-ref-set-control-validation';
import {
  handleControlAttributeChanges,
  handleControlDisable,
  handleControlReadonly,
  handleElementBlur,
  handleElementFocus,
} from './ref-manager-helpers/margarita-form-ref-state-changes';
import {
  setNodeValueOnControlValueChanges,
  setControlValueOnNodeValueChanges,
} from './ref-manager-helpers/margarita-form-ref-value-changes';

interface RefEntry {
  node: MargaritaFormBaseElement;
  cleanup: () => void;
}

class RefManager<CONTROL extends MFC> extends BaseManager {
  #refs: RefEntry[] = [];
  public changes = new BehaviorSubject<MargaritaFormBaseElement<CONTROL>[]>([]);

  constructor(public control: CONTROL) {
    super();

    this.onCleanup = () => {
      this.#refs.forEach(({ node, cleanup }) => {
        if (!node || !node.controls) return;
        const { controls = [] } = node;
        const index = controls.findIndex((control: MFC) => control.key === this.control.key);
        if (index > -1) {
          node.controls.splice(index, 1);
          cleanup();
        }
      });
    };

    this.onResubscribe = () => {
      const refs = [...this.#refs];
      refs.forEach(({ node }) => {
        this.#deleteNodeRef(node);
        this.addRef(node);
      });
    };
  }

  #emitChanges() {
    this.changes.next(this.#refs);
  }

  public get refs() {
    return this.#refs;
  }

  public disconnectRef(node: MargaritaFormBaseElement<CONTROL['field']> | null) {
    if (!node) return;
    this.#deleteNodeRef(node);
  }

  public addRef(node: MargaritaFormBaseElement<CONTROL> | null | undefined) {
    if (!node) return;
    const alreadyIncluded = this.#connectNodeAndControl(node);
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
    const handleAttributes = handleControlAttributeChanges(params);

    const unsubscribe = () => {
      try {
        handleControlValueChange?.unsubscribe();
        handleNodeValueChange?.unsubscribe();
        handleDisable?.unsubscribe();
        handleReadOnly?.unsubscribe();
        handleBlur?.unsubscribe();
        handleFocus?.unsubscribe();
        handleSubmit?.unsubscribe();
        handleAttributes?.unsubscribe();
        mutationObserver.disconnect();
      } catch (error) {
        //
      }
    };

    const mutationObserver = new MutationObserver((events) => {
      events.forEach((event) => {
        event.removedNodes.forEach((removedNode) => {
          if (removedNode === node) {
            unsubscribe();
            this.#emitChanges();
          }
        });
      });
    });

    if (node.parentNode) {
      mutationObserver.observe(node.parentNode, { childList: true });
    }

    const cleanup = () => {
      unsubscribe();
      mutationObserver.disconnect();
    };

    this.#refs.push({
      node,
      cleanup,
    });

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

  #connectNodeAndControl(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this.#defineControlsToNode(node);

    const controlInNode = node.controls?.includes(this.control);
    if (!controlInNode) {
      node.controls?.push(this.control);
    }
    const nodeInControl = this.refs.includes(node);
    const alreadyIncluded = controlInNode || nodeInControl;
    return alreadyIncluded;
  }

  #removeControlFromNode(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this.#defineControlsToNode(node);

    const controlInNode = node.controls?.includes(this.control);
    if (controlInNode) {
      const { controls = [] } = node;
      const index = controls.findIndex((control: MFC) => control === this.control);
      if (index > -1) controls.splice(index, 1);
    }
  }

  #deleteNodeRef(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this.#removeControlFromNode(node);
    const index = this.refs.findIndex((ref) => ref.node === node);
    if (index > -1) this.refs.splice(index, 1);
  }
}

export { RefManager };
