import { Observable } from 'rxjs';
import { ExtensionName, MFC } from '../../margarita-form-types';

export class ExtensionBaseMethods {
  public static extensionName?: ExtensionName;
  readonly requireRoot?: boolean;
  constructor(public root: MFC) {}
  // Value manager
  getValueObservable?: <T>(control: MFC) => Observable<T | undefined>;
  handleValueUpdate?: <T>(value: T) => void | Promise<void>;
  getValueSnapshot?: <T>() => T | undefined;
  // Control manager
  modifyField?: (field: any, parentControl: MFC) => any;
}

export class ExtensionBase<C extends object> implements ExtensionBaseMethods {
  public config: C = {} as C;
  constructor(public root: MFC) {}

  static withConfig<C>(config: C) {
    return withConfig<any>(this, config as any);
  }
}

export const withConfig = <T extends typeof ExtensionBase<any>>(extension: T, config: Partial<InstanceType<T>['config']>) => {
  return new Proxy(extension, {
    construct(target: any, args: any) {
      const final = new target(...args);
      final.config = { ...target.config, ...config };
      return final;
    },
  });
};
