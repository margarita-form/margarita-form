import { StorageLike } from '../../margarita-form-types';

export const SessionStorage: StorageLike | undefined = typeof window !== 'undefined' ? window.sessionStorage : undefined;
