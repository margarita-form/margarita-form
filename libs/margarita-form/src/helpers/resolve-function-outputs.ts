import { combineLatest, firstValueFrom, from, map, Observable, of } from 'rxjs';
import { CommonRecord, MargaritaFormResolver, MargaritaFormResolverOutput, MFC, ResolverParams } from '../typings/margarita-form-types';
import { valueIsAsync } from './async-checks';

const stringMatcher = /\$\$([^:]+):?([^:]*)?:?([^:]*)/gi;

type ResolverEntry<O = unknown> = [string, O];
type ResolverOutputMap<O> = Record<PropertyKey, MargaritaFormResolverOutput<O>>;
type ResolverOutputResultMap<O> = Record<PropertyKey, O>;
type Resolvers<O> = CommonRecord<MargaritaFormResolver<O, any, any>>;
type StrictResultFn = (getter: unknown, resolvers: unknown) => unknown;
type Strict = boolean | StrictResultFn;

interface GetResolverOutputParams<O> {
  getter: unknown;
  control: MFC;
  resolvers?: Resolvers<O>;
  contextData?: CommonRecord;
  strict?: Strict;
}

const resolveStrict = (strictResultFn: Strict, getter: unknown, resolvers: unknown) => {
  if (typeof strictResultFn === 'function') return strictResultFn(getter, resolvers);
  return undefined;
};

export const getResolverOutput = <OUTPUT>({
  getter,
  control,
  resolvers = control.resolvers,
  contextData = {},
  strict = false,
}: GetResolverOutputParams<OUTPUT>): undefined | MargaritaFormResolverOutput<OUTPUT> => {
  const context = control.generateContext(undefined, contextData);

  if (typeof getter === 'function') {
    const result = getter(context);
    return result;
  }

  if (typeof getter === 'string') {
    const stringConfig = stringMatcher.test(getter);
    if (stringConfig) {
      const [name, ...rest] = getter.split(':');
      const getterName = name.slice(2);
      const data = Object.fromEntries(rest.map((item) => item.split(':')));
      const combinedData = { ...contextData, ...data };
      return getResolverOutput({ getter: getterName, control, resolvers, contextData: combinedData, strict });
    }
    if (resolvers[getter]) {
      return resolvers[getter](context);
    }
  }

  if (typeof getter === 'object' && getter) {
    if (Array.isArray(getter)) return getter as OUTPUT;
    try {
      if ('name' in getter && (getter.name as string).startsWith('$$')) {
        const { name, ...rest } = getter as ResolverParams;
        const getterName = name.slice(2);
        const combinedData = { ...contextData, ...rest };
        return getResolverOutput({ getter: getterName, control, resolvers, contextData: combinedData, strict });
      }
    } catch (error) {
      //
    }
  }
  if (strict) return resolveStrict(strict, { getter }, resolvers) as OUTPUT;
  return getter as OUTPUT;
};

export const getResolverOutputMap = <OUTPUT = unknown>(
  obj: CommonRecord,
  control: MFC,
  resolvers: Resolvers<OUTPUT> = control.resolvers,
  contextData: CommonRecord = {},
  strict: Strict = false
): ResolverOutputMap<OUTPUT> => {
  return Object.entries(obj).reduce((acc, [key, params]) => {
    const valueOutput = getResolverOutput<OUTPUT>({ getter: params, control, resolvers, contextData, strict: true });
    if (valueOutput !== undefined) {
      acc[key] = valueOutput;
      return acc;
    }
    const combinedParams = { ...contextData, params };
    const keyOutput = getResolverOutput<OUTPUT>({ getter: key, control, resolvers, contextData: combinedParams, strict: true });
    if (keyOutput !== undefined) {
      acc[key] = keyOutput;
      return acc;
    }
    if (strict) acc[key] = resolveStrict(strict, { key, value: params }, resolvers) as OUTPUT;
    else acc[key] = params as OUTPUT;
    if (acc[key] === undefined) delete acc[key];
    return acc;
  }, {} as ResolverOutputMap<OUTPUT>);
};

export const getResolverOutputObservable = <OUTPUT = unknown>(
  name: string,
  resolver: MargaritaFormResolverOutput<undefined | OUTPUT>,
  control: MFC
) => {
  const longTime = setTimeout(() => {
    console.warn(`Resolver is taking long time to finish!`, { name, resolver, control });
  }, control.config.asyncFunctionWarningTimeout || 5000);

  if (resolver instanceof Observable) {
    const observable = resolver.pipe(
      map((result) => {
        clearTimeout(longTime);
        return result;
      })
    );
    return observable;
  }

  const promise = Promise.resolve(resolver).then((result) => {
    clearTimeout(longTime);
    return result;
  });

  return from(promise) as Observable<undefined | OUTPUT>;
};

export const getResolverOutputPromise = <OUTPUT = unknown>(
  name: string,
  resolver: MargaritaFormResolverOutput<undefined | OUTPUT>,
  control: MFC
) => {
  const observable = getResolverOutputObservable<OUTPUT>(name, resolver, control);
  return firstValueFrom(observable);
};

export const getResolverOutputSyncronous = <OUTPUT = unknown>(resolver: MargaritaFormResolverOutput<undefined | OUTPUT>) => {
  const isAsync = valueIsAsync(resolver);
  if (isAsync) return undefined;
  return resolver;
};

export const getResolverOutputMapObservable = <OUTPUT = unknown>(
  obj: CommonRecord,
  control: MFC,
  resolvers: Resolvers<OUTPUT> = control.resolvers,
  contextData: CommonRecord = {},
  strict: Strict = false
): Observable<ResolverOutputResultMap<OUTPUT>> => {
  const empty = !obj || Object.keys(obj).length === 0;
  if (empty) return of({}) as Observable<ResolverOutputResultMap<OUTPUT>>;
  const mapped = getResolverOutputMap<OUTPUT>(obj, control, resolvers, contextData, strict);
  const observables = Object.entries(mapped).reduce((acc, [key, output]) => {
    const observable = getResolverOutputObservable<OUTPUT>(key, output, control);
    const withKey = observable.pipe(map((result) => [key, result] as ResolverEntry<OUTPUT>));
    acc.push(withKey);
    return acc;
  }, [] as Observable<ResolverEntry<OUTPUT>>[]);
  if (observables.length === 0) return of({}) as Observable<ResolverOutputResultMap<OUTPUT>>;
  return combineLatest(observables).pipe(map((values) => Object.fromEntries(values)));
};

export const getResolverOutputMapPromise = async <OUTPUT = unknown>(
  obj: CommonRecord,
  control: MFC,
  resolvers: Resolvers<OUTPUT> = control.resolvers,
  contextData: CommonRecord = {},
  strict: Strict = false
): Promise<ResolverOutputResultMap<OUTPUT>> => {
  const observable = getResolverOutputMapObservable<OUTPUT>(obj, control, resolvers, contextData, strict);
  const result = await firstValueFrom(observable);
  return result;
};

export const getResolverOutputMapSyncronous = <OUTPUT = unknown>(
  obj: CommonRecord,
  control: MFC,
  resolvers: Resolvers<OUTPUT> = control.resolvers,
  contextData: CommonRecord = {},
  strict: Strict = false
): ResolverOutputResultMap<OUTPUT> => {
  const mapped = getResolverOutputMap<OUTPUT>(obj, control, resolvers, contextData, strict);
  return Object.entries(mapped).reduce((acc, [key, resolver]) => {
    const result = getResolverOutputSyncronous(resolver);
    if (result !== undefined) acc[key] = resolver as OUTPUT;
    return acc;
  }, {} as ResolverOutputResultMap<OUTPUT>);
};
