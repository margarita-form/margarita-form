import type { MFC } from '../margarita-form-types';
import { MargaritaFormStorageExtension } from './margarita-form-storage-extension';
import { MargaritaFormSyncronizationExtension } from './margarita-form-syncronization-extension';

export const margaritaFormExtensions = {
  storage: MargaritaFormStorageExtension,
  syncronization: MargaritaFormSyncronizationExtension,
};

type Keys = keyof typeof margaritaFormExtensions;
export type MargaritaFormExtensions = {
  [T in Keys]: InstanceType<(typeof margaritaFormExtensions)[T]>;
};

export const initializeExtensions = (form: MFC) => {
  const extensionEntries = Object.entries(margaritaFormExtensions).map(([key, Extension]) => [key, new Extension(form)]);
  return Object.fromEntries(extensionEntries) as MargaritaFormExtensions;
};
