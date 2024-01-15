import { MFC } from '../../typings/margarita-form-types';
import { BrowserStorageBase } from './browser-storage';

export class SessionStorageExtension extends BrowserStorageBase {
  constructor(public override root: MFC) {
    super(root, 'sessionStorage');
  }
}

export * from './browser-storage';
