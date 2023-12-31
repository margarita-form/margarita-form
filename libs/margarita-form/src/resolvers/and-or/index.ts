import { combineLatest, map } from 'rxjs';
import { getResolverOutput, getResolverOutputObservable } from '../../helpers/resolve-function-outputs';
import { MargaritaFormResolver } from '../../typings/core-types';

type Resolvers = (string | MargaritaFormResolver<boolean>)[];

export const andResolver: MargaritaFormResolver<boolean, Resolvers> = ({ control, params: resolvers }) => {
  if (!resolvers) return false;
  const outputs = resolvers.map((resolver, index) => {
    const output = getResolverOutput<boolean>(String(index), resolver, control);
    return getResolverOutputObservable(String(index), output, control);
  });
  return combineLatest(outputs).pipe(
    map((results) => {
      const valid = results.every((result) => result);
      return valid;
    })
  );
};

export const orResolver: MargaritaFormResolver<boolean, Resolvers> = ({ control, params: resolvers }) => {
  if (!resolvers) return false;
  const outputs = resolvers.map((resolver, index) => {
    const output = getResolverOutput<boolean>(String(index), resolver, control);
    return getResolverOutputObservable(String(index), output, control);
  });
  return combineLatest(outputs).pipe(
    map((results) => {
      const valid = results.some((result) => result);
      return valid;
    })
  );
};
