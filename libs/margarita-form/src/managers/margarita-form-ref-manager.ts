import { BaseManager, ManagerName } from './margarita-form-base-manager';
import { MFC, MargaritaFormBaseElement } from '../margarita-form-types';
import {
  handleFormElementFormData,
  handleFormElementReset,
  handleFormElementSubmit,
} from './ref-manager-helpers/margarita-form-ref-form-submit';
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

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    ref: RefManager<MFC>;
  }
}

interface RefEntry<CONTROL extends MFC> {
  node: MargaritaFormBaseElement<CONTROL, HTMLElement>;
  cleanup: () => void;
}

class RefManager<CONTROL extends MFC> extends BaseManager<RefEntry<CONTROL>[]> {
  public static override managerName: ManagerName = 'ref';
  constructor(public override control: CONTROL) {
    super(control, []);
  }

  public override onInitialize() {
    const refs = [...this.value];
    refs.forEach(({ node }) => {
      this._deleteNodeRef(node);
      this.addRef(node);
    });
  }

  public override onCleanup(): void {
    this.value.forEach(({ node, cleanup }) => {
      if (!node || !node.controls) return;
      const { controls = [] } = node;
      const index = controls.findIndex((control: MFC) => control.key === this.control.key);
      if (index > -1) {
        node.controls.splice(index, 1);
        cleanup();
      }
    });
  }

  private _emitChanges() {
    this.emitChange(this.value);
  }

  public get formElement() {
    const ref = this.value.find((ref) => ref.node.tagName === 'FORM');
    if (!ref) return undefined;
    const formElement = ref.node as HTMLFormElement;
    return formElement;
  }

  public get formAction() {
    const formElement = this.formElement;
    if (!formElement) return undefined;
    const action = formElement.getAttribute('action');
    return action;
  }

  public get useNativeSubmit() {
    const formElement = this.formElement;
    if (!formElement) return false;
    const useNativeSubmit = formElement.hasAttribute('data-use-action');
    return useNativeSubmit;
  }

  public nativeSubmit() {
    try {
      const formElement = this.formElement;
      if (!formElement) return;
      formElement.submit();
    } catch (error) {
      throw {
        message: 'Native submit failed',
        error,
      };
    }
  }

  public disconnectRef(node: MargaritaFormBaseElement<CONTROL> | null) {
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
    const handleReset = handleFormElementReset(params);
    const handleFormData = handleFormElementFormData(params);
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
        handleReset?.unsubscribe();
        handleFormData?.unsubscribe();
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

    this.value.push({
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
    const nodeInControl = this.value.some((ref) => ref.node === node);
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
    const index = this.value.findIndex((ref) => ref.node === node);
    if (index > -1) this.value.splice(index, 1);
  }
}

export { RefManager };
