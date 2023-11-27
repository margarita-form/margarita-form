/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable } from 'rxjs';
import { Extensions, MFC, MFF } from '../../margarita-form-types';
import { SyncronizationExtensionBase } from './syncronization-extension-base';

export interface BroadcastLikeConstructor {
  new (key: string, control: MFC): BroadcastLike;
}

export interface BroadcasterMessage<DATA = unknown> {
  key: string;
  uid: string;
  value?: DATA;
  requestSend?: boolean;
}

export interface BroadcastLike {
  postMessage(message: BroadcasterMessage): void;
  listenToMessages<DATA>(): void | Observable<BroadcasterMessage<DATA>>;
}

declare module '../../margarita-form-control' {
  export interface MargaritaFormControl<FIELD extends MFF = MFF> {
    get syncronization(): Extensions['syncronization'];
  }
}

declare module '../../typings/expandable-types' {
  export interface Extensions {
    syncronization?: typeof SyncronizationExtensionBase;
  }
}
