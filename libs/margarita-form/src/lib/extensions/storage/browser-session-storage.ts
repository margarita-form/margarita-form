import { MFC } from '../../margarita-form-types';
import { BrowserStorageBase } from './browser-storage';

export class SessionStorage extends BrowserStorageBase {
  constructor(public override root: MFC) {
    super(root, 'sessionStorage');
  }
}
