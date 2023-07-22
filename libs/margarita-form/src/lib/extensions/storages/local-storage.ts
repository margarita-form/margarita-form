import { StorageLike } from '../../margarita-form-types';
import BrowserStorage from './browser-storage';

export const LocalStorage: StorageLike = BrowserStorage.create('localStorage');

export default LocalStorage;
