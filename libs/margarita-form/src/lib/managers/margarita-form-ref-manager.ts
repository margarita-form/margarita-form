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
  private _refs: RefEntry[] = [];
  public changes = new BehaviorSubject<MargaritaFormBaseElement<CONTROL>[]>([]);

  constructor(public control: CONTROL) {
    super();

    this.onCleanup = () => {
      this._refs.forEach(({ node, cleanup }) => {
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
      const refs = [...this._refs];
      refs.forEach(({ node }) => {
        this._deleteNodeRef(node);
        this.addRef(node);
      });
    };
  }

  private _emitChanges() {
    this.changes.next(this._refs);
  }

  public get refs() {
    return this._refs;
  }

  public disconnectRef(node: MargaritaFormBaseElement<CONTROL['field']> | null) {
    if (!node) return;
    this._deleteNodeRef(node);
  }

  public addRef(node: MargaritaFormBaseElement<CONTROL> | null | undefined) {
    if (!node) return;
    const alreadyIncluded = this._connectNodeAndControl(node);
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
            this._emitChanges();
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

    this._refs.push({
      node,
      cleanup,
    });

    this._emitChanges();
  }

  private _defineControlsToNode(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    const nodeHasControls = node.controls;
    if (!nodeHasControls) {
      Object.defineProperty(node, 'controls', {
        value: [],
      });
    }
  }

  private _connectNodeAndControl(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this._defineControlsToNode(node);

    const controlInNode = node.controls?.includes(this.control);
    if (!controlInNode) {
      node.controls?.push(this.control);
    }
    const nodeInControl = this.refs.includes(node);
    const alreadyIncluded = controlInNode || nodeInControl;
    return alreadyIncluded;
  }

  private _removeControlFromNode(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this._defineControlsToNode(node);

    const controlInNode = node.controls?.includes(this.control);
    if (controlInNode) {
      const { controls = [] } = node;
      const index = controls.findIndex((control: MFC) => control === this.control);
      if (index > -1) controls.splice(index, 1);
    }
  }

  private _deleteNodeRef(node: MargaritaFormBaseElement<CONTROL>) {
    if (!node) return;
    this._removeControlFromNode(node);
    const index = this.refs.findIndex((ref) => ref.node === node);
    if (index > -1) this.refs.splice(index, 1);
  }
}

export { RefManager };
