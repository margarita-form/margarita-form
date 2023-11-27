import { MFC } from '../../margarita-form-types';
import { BrowserStorageBase } from './browser-storage';

declare module '../../typings/expandable-types' {
  export interface Extensions {
    storage?: typeof SessionStorage;
  }
}

export class SessionStorage extends BrowserStorageBase {
  constructor(public override control: MFC) {
    super(control, 'sessionStorage');
  }
}
