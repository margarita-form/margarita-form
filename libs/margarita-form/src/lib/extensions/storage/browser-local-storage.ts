import { MFC } from '../../margarita-form-types';
import { BrowserStorageBase } from './browser-storage';

export class LocalStorage extends BrowserStorageBase {
  constructor(public override control: MFC) {
    super(control, 'localStorage');
  }
}
