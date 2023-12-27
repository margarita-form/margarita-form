import { ControlContext, MFC, MFGF, NotFunction } from '../typings/margarita-form-types';

export type CoreGetterContext = { parent?: MFC; field?: MFGF } & ControlContext;
export type CoreGetterFn<OUTPUT> = (context: CoreGetterContext) => OUTPUT;
export type CoreGetter<OUTPUT> = OUTPUT | CoreGetterFn<OUTPUT>;

export const coreResolver = <OUTPUT extends NotFunction>(getter: CoreGetter<OUTPUT>, control: MFC): OUTPUT => {
  const controlContext = control.getControlContext();
  const context: CoreGetterContext = control.isRoot ? { ...controlContext } : { parent: control.parent, ...controlContext };
  if (typeof getter === 'function') return getter(context);
  return getter;
};
