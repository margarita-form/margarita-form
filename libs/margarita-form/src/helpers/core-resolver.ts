import { ControlContext, MFC, MFGF, OrT } from '../typings/margarita-form-types';
import { valueIsDefined } from './check-value';

export type CoreGetterContext = { parent?: MFC; field?: MFGF } & Partial<ControlContext>;
export type CoreGetterFn<OUTPUT> = (context: CoreGetterContext) => OUTPUT;
export type CoreGetter<OUTPUT> = OrT<OUTPUT> | CoreGetterFn<OUTPUT>;

export const coreResolver = <OUTPUT = any>(
  getter: undefined | CoreGetter<OUTPUT>,
  control: MFC,
  asParent = false,
  defaultValue?: OUTPUT
): OUTPUT => {
  const controlContext = control._getCustomContext();
  const parent = asParent ? control : control.isRoot ? undefined : control.parent;
  const context: CoreGetterContext = { parent, ...controlContext };
  if (typeof getter === 'function') {
    const result = getter(context);
    if (!valueIsDefined(result)) return defaultValue as OUTPUT;
    return result;
  }
  if (!valueIsDefined(getter)) return defaultValue as OUTPUT;
  return getter as OUTPUT;
};
