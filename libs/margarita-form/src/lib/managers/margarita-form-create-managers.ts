import { MargaritaFormControl } from '../margarita-form-control';
import type { MFCM } from '../margarita-form-types';
import { margaritaFormControlManagers } from './margarita-form-default-managers';

export type ManagerInstances = {
  [Property in keyof MFCM]: InstanceType<MFCM[Property]>;
};

export const createManagers = <CONTROL extends MargaritaFormControl>(control: CONTROL): ManagerInstances => {
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
  Object.values(control.managers).forEach((manager) => manager._init());
  return control.managers;
};
