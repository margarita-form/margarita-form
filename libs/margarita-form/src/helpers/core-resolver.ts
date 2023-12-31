import { ControlContext, MFC, MFGF, OrT } from '../typings/margarita-form-types';

export type CoreGetterContext = { parent?: MFC; field?: MFGF } & ControlContext;
export type CoreGetterFn<OUTPUT> = (context: CoreGetterContext) => OUTPUT;
export type CoreGetter<OUTPUT> = OrT<OUTPUT> | CoreGetterFn<OUTPUT>;

export const coreResolver = <OUTPUT = any>(getter: undefined | CoreGetter<OUTPUT>, control: MFC, asParent = false): OUTPUT => {
  const controlContext = control.getControlContext();
  const parent = asParent ? control : control.isRoot ? undefined : control.parent;
  const context: CoreGetterContext = { parent, ...controlContext };
  if (typeof getter === 'function') return getter(context);
  return getter as OUTPUT;
};
