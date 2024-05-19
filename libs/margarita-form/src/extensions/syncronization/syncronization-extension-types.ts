/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, GenerateKeyFunction, MFF, MFGF } from '../../typings/margarita-form-types';
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

declare module '@margarita-form/core' {
  export interface ControlBase<FIELD extends MFF> {
    get syncronization(): Extensions['syncronization'];
  }

  export interface Extensions {
    syncronization?: typeof SyncronizationExtensionBase;
  }

  export interface Configs {
    syncronization?: SyncronizationExtensionConfig;
  }
}
