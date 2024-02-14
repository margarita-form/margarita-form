import { ExtensionName, MFC } from '../../typings/margarita-form-types';
import { ExtensionBase } from '../base/extension-base';
import _get from 'lodash.get';

export class HTMLTemplateExtension extends ExtensionBase {
  public static override extensionName: ExtensionName = 'htmlTemplate';
  constructor(public override root: MFC) {
    super(root);
  }

  public parseTemplate = (control: MFC, template: string | undefined = control.field.htmlTemplate) => {
    if (!template) return undefined;
    const variableRegex = /{{(.*?)}}/g;
    const variables = template.match(variableRegex);
    if (!variables) return template;
    const parsedTemplate = variables.reduce((acc, variable) => {
      const variableName = variable.replace('{{', '').replace('}}', '');
      const parts = variableName.split('.');
      const context = control.generateContext();
      const variables = { ...control, ...context, ...control.field, control };
      const variableValue = _get(variables, parts);
      return acc.replace(variable, variableValue);
    }, template);
    return parsedTemplate;
  };

  public appendChildControls = (control: MFC, initial = true) => {
    if (control.managers.ref && control.expectChildControls) {
      const [currentRef] = control.managers.ref.value;
      if (currentRef) {
        const isContainer = currentRef.node.hasAttribute('mf-controls-container');
        const container = isContainer ? currentRef.node : currentRef.node.querySelector<HTMLElement>('[mf-controls-container]');
        if (!container) return;

        if (initial) {
          const subscription = control.managers.controls.changes.subscribe(() => {
            this.appendChildControls(control, false);
          });
          control.subscriptions.push(subscription);
        }

        control.controls
          .filter(({ field }) => field.htmlTemplate)
          .forEach((childControl) => {
            const identifier = `MFC:${childControl.uid}`;
            // Find comment with identifier
            const existingComment = Array.from(container.childNodes).find(
              (node) => node.nodeType === Node.COMMENT_NODE && node.nodeValue === identifier
            );
            if (existingComment) return;
            const tempElement = document.createElement('template');
            const comment = document.createComment(identifier);
            tempElement.innerHTML = this.parseTemplate(childControl) as string;
            const childNodes = Array.from(tempElement.content.children);
            container.append(comment, ...childNodes);
            const refNode = container.querySelector('[mf-set-ref]');
            this.addListeners(childControl, container);
            if (refNode) {
              refNode.removeAttribute('mf-set-ref');
              childControl.setRef(refNode);
            }
          });
      }
    }
  };

  public appendHTMLTemplate = (control: MFC, parent: HTMLElement) => {
    if (control.field.htmlTemplate) {
      const isTemplateTarget = parent.hasAttribute('mf-template-target');
      if (isTemplateTarget) parent.removeAttribute('mf-template-target');
      parent.innerHTML = control.field.htmlTemplate;
    }
  };

  public addListeners = (control: MFC, node: HTMLElement) => {
    node.querySelectorAll<HTMLElement>('[mf-listen]').forEach((element) => {
      const attr = element.getAttribute('mf-listen') as string;
      const [eventName, resolverName] = attr.split(',');
      const resolver = control.resolvers[resolverName];
      if (!resolver) return;
      if (typeof resolver !== 'function') return;
      element.addEventListener(eventName, () => {
        const context = control.generateContext();
        resolver(context);
      });
    });
  };

  public override afterRefSet = (control: MFC, node: HTMLElement) => {
    if (control.field.htmlTemplate) {
      const target = node.querySelector<HTMLElement>('[mf-template-target]');
      if (target) this.appendHTMLTemplate(control, target);
    }
    this.appendChildControls(control);
  };

  public override afterReady = (control: MFC) => {
    if (control.isRoot) {
      const rootTarget = document.querySelector<HTMLElement>('[mf-root]');
      if (rootTarget) control.setRef(rootTarget);
    }
  };
}

export * from './html-template-types';
