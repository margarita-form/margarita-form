import { Observable } from 'rxjs';
import { ExtensionName, MFC } from '../../margarita-form-types';

export class ExtensionBase {
  public static extensionName: ExtensionName;
  readonly requireRoot?: boolean;
  readonly activeCheck?: (control: MFC) => boolean;
  public config: object = {};
  constructor(public root: MFC) {}

  getValueObservable?: <T>(control: MFC) => Observable<T | undefined>;
  handleValueUpdate?: <T>(control: MFC, value: T) => void | Promise<void>;
  getValueSnapshot?: <T>(control: MFC) => T | undefined;
  // Control manager
  modifyField?: (field: any, parentControl: MFC) => any;

  public getConfig(control = this.root): this['config'] {
    const staticThis = this.constructor as typeof ExtensionBase;
    const configName = staticThis.extensionName as string;
    const controlConfig = (control.config as Record<string, object>)[configName] || {};
    return { ...this.config, ...controlConfig } as this['config'];
  }

  static withConfig<C extends object>(config: C) {
    return withConfig<any>(this, config as any);
  }
}

export const withConfig = <T extends typeof ExtensionBase>(extension: T, config: Partial<InstanceType<T>['config']>) => {
  return new Proxy(extension, {
    construct(target: any, args: any) {
      const final = new target(...args);
      final.config = { ...target.config, ...config };
      return final;
    },
  });
};
