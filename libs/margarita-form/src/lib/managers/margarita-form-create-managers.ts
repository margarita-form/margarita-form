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
  return control.managers;
};

export const startPrepareLoop = <CONTROL extends MargaritaFormControl<MFF>>(control: CONTROL) => {
  if (!control.prepared) {
    control.prepared = true;
    Object.values(control.managers).forEach((manager) => manager.prepare());
  }
  control.controls.forEach((control) => {
    startPrepareLoop(control);
  });
};

export const startOnInitializeLoop = <CONTROL extends MargaritaFormControl<MFF>>(control: CONTROL) => {
  if (!control.initialized) {
    control.initialized = true;
    Object.values(control.managers).forEach((manager) => manager.onInitialize());
  }
  control.controls.forEach((control) => {
    startOnInitializeLoop(control);
  });
};

export const startAfterInitializeLoop = <CONTROL extends MargaritaFormControl<MFF>>(control: CONTROL) => {
  if (!control.ready) {
    control.ready = true;
    Object.values(control.managers).forEach((manager) => manager.afterInitialize());
  }
  control.controls.forEach((control) => {
    startAfterInitializeLoop(control);
  });
};
