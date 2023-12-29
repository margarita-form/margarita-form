import { ControlContext, MFC, MFGF, NotFunction } from '../typings/margarita-form-types';

export type CoreGetterContext = { parent?: MFC; field?: MFGF } & ControlContext;
export type CoreGetterFn<OUTPUT> = (context: CoreGetterContext) => OUTPUT;
export type CoreGetter<OUTPUT> = OUTPUT | CoreGetterFn<OUTPUT>;

export const coreResolver = <OUTPUT extends NotFunction>(getter: CoreGetter<OUTPUT>, control: MFC, asParent = false): OUTPUT => {
  const controlContext = control.getControlContext();
  const parent = asParent ? control : control.isRoot ? undefined : control.parent;
  const context: CoreGetterContext = { parent, ...controlContext };
  if (typeof getter === 'function') return getter(context);
  return getter;
};
