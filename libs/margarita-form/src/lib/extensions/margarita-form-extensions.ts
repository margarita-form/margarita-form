import type { MFC } from '../margarita-form-types';
import { MargaritaFormI18NExtension } from './margarita-form-i18n-extension';
import { MargaritaFormStorageExtension } from './margarita-form-storage-extension';
import { MargaritaFormSyncronizationExtension } from './margarita-form-syncronization-extension';

export const margaritaFormExtensions = {
  storage: MargaritaFormStorageExtension,
  syncronization: MargaritaFormSyncronizationExtension,
  localization: MargaritaFormI18NExtension,
};

type Keys = keyof typeof margaritaFormExtensions;
export type MargaritaFormExtensions = {
  [T in Keys]: InstanceType<(typeof margaritaFormExtensions)[T]>;
};

export const initializeExtensions = <CONTROL extends MFC>(control: CONTROL) => {
  const extensionEntries = Object.entries(margaritaFormExtensions).map(([key, Extension]) => [key, new Extension(control)]);
  return Object.fromEntries(extensionEntries) as MargaritaFormExtensions;
};
