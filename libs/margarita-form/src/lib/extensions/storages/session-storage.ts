import { StorageLike } from '../../margarita-form-types';
import BrowserStorage from './browser-storage';

export const SessionStorage: StorageLike = BrowserStorage.create('sessionStorage');

export default SessionStorage;
