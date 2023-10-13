import type { MargaritaFormControl } from '../margarita-form-control';
import type { MFCM, MFF } from '../margarita-form-types';
import { margaritaFormControlManagers } from './margarita-form-default-managers';

export type ManagerInstances = {
  [Property in keyof MFCM]: InstanceType<MFCM[Property]>;
};

export const createManagers = <CONTROL extends MargaritaFormControl<MFF>>(control: CONTROL): ManagerInstances => {
  // We need to initialize the managers object before we create the instances as some of the managers expect other managers to be present already.
  Object.assign(control, {
    managers: {},
  });
  Object.entries(margaritaFormControlManagers).forEach(([key, constructor]) => {
    const manager = new constructor(control);
    Object.assign(control.managers, {
      [key]: manager,
    });
    return [key, manager];
  });
  Object.values(control.managers).forEach((manager) => manager.onInitialize());
  return control.managers;
};

export const startAfterInitialize = <CONTROL extends MargaritaFormControl<MFF>>(control: CONTROL) => {
  if (!control.ready) {
    Object.values(control.managers).forEach((manager) => manager.afterInitialize());
    control.ready = true;
  }
  control.controls.forEach((control) => {
    startAfterInitialize(control);
  });
};
