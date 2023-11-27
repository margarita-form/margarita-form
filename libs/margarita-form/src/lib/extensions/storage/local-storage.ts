import { MFC } from '../../margarita-form-types';
import { BrowserStorageBase } from './browser-storage';

declare module '../../typings/expandable-types' {
  export interface Extensions {
    storage?: typeof LocalStorage;
  }
}

export class LocalStorage extends BrowserStorageBase {
  constructor(public override control: MFC) {
    super(control, 'localStorage');
  }
}
