import { StorageLike } from '../../margarita-form-types';

export const LocalStorage: StorageLike | undefined = typeof window !== 'undefined' ? window.localStorage : undefined;
