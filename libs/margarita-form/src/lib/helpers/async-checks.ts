import { Observable } from 'rxjs';

export const checkAsync = (value: any): boolean => {
  const isPromise = value instanceof Promise;
  const isObservable = value instanceof Observable;
  return isPromise || isObservable;
};
