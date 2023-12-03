import { Observable } from 'rxjs';
import { ExtensionName, MFC } from '../../margarita-form-types';

export class ExtensionBase {
  public static extensionName: ExtensionName;
  readonly requireRoot?: boolean;
  public config: unknown = {};
  constructor(public root: MFC) {}

  getValueObservable?: <T>(control: MFC) => Observable<T | undefined>;
  handleValueUpdate?: <T>(value: T) => void | Promise<void>;
  getValueSnapshot?: <T>() => T | undefined;
  // Control manager
  modifyField?: (field: any, parentControl: MFC) => any;

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
