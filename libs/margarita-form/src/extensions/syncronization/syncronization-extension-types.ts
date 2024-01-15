/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, GenerateKeyFunction, MFF } from '../../typings/margarita-form-types';
import { SyncronizationExtensionBase } from './syncronization-extension-base';

export interface SyncronizationExtensionConfig {
  syncronizationKey?: 'key' | 'name' | GenerateKeyFunction;
}

export interface BroadcasterMessage<DATA = unknown> {
  key: string;
  uid: string;
  value?: DATA;
  requestSend?: boolean;
}

declare module '../../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF<any> = MFF> {
    get syncronization(): Extensions['syncronization'];
  }
}

declare module '../../typings/expandable-types' {
  export interface Extensions {
    syncronization?: typeof SyncronizationExtensionBase;
  }

  export interface Configs {
    syncronization?: SyncronizationExtensionConfig;
  }
}
