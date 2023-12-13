import { MFC } from '../../typings/margarita-form-types';
import { BrowserStorageBase } from './browser-storage';

export class LocalStorageExtension extends BrowserStorageBase {
  constructor(public override root: MFC) {
    super(root, 'localStorage');
  }
}

export * from './browser-storage';
