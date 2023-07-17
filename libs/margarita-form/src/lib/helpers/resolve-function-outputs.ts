import { combineLatest, map, Observable, ObservableInput } from 'rxjs';
import { MargaritaFormFieldContext, MargaritaFormResolverOutput, MFC } from '../margarita-form-types';

type MargaritaFormResolverEntry<OUTPUT = unknown> = [string, OUTPUT];

interface ResolverParams {
  resolverName: string;
  params: unknown;
  errorMessage?: string;
}

const ResolverParamKeys = ['resolverName', 'params', 'errorMessage'];

export const mapResolverEntries = <OUTPUT = unknown>({
  title,
  from,
  context,
  resolveStaticValues = true,
  resolvers = context.control.resolvers,
}: {
  title: string;
  from: Record<string, unknown>;
  context: MargaritaFormFieldContext;
  resolveStaticValues?: boolean;
  resolvers?: import('../margarita-form-types').MargaritaFormResolvers;
}) => {
  if (!from) return Promise.resolve({});
  const entries = Object.entries(from).reduce((acc, [key, value]) => {
    if (!value) return acc;

    if (typeof value === 'function') {
      const result = value(context);
      acc.push([key, result]);
      return acc;
    }

    const getResolver = ({ resolverName, params, errorMessage }: ResolverParams) => {
      const resolverFn = resolvers[resolverName];
      if (typeof resolverFn === 'function') {
        const result = resolverFn({ ...context, params, errorMessage });
        acc.push([key, result]);
        return acc;
      }
      if (resolveStaticValues) acc.push([key, params as OUTPUT]);
      return acc;
    };

    const stringConfig = typeof value === 'string' && /\$\$([^:]+):?([^:]+)?:?([^:]+)/gi.exec(value);
    if (stringConfig) {
      const [resolverName, params, errorMessage] = stringConfig.splice(1, 3);
      return getResolver({ resolverName: resolverName, params, errorMessage });
    }

    const isResolverConfigObject = () => {
      const isObject = typeof value === 'object';
      if (!isObject) return null;
      const keys = Object.keys(value);
      const hasResolverName = keys.includes('resolverName');
      if (!hasResolverName) return null;
      const keysAreValid = keys.every((key) => ResolverParamKeys.includes(key));
      if (!keysAreValid) return null;
      return value as ResolverParams;
    };

    const objectConfig = isResolverConfigObject();
    if (objectConfig) {
      return getResolver(objectConfig);
    }

    return getResolver({ resolverName: key, params: value });
  }, [] as [string, MargaritaFormResolverOutput<OUTPUT>][]);

  return resolveFunctionOutputs(title, context, entries);
};

export const resolveFunctionOutputs = <OUTPUT = unknown>(
  title: string,
  context: MargaritaFormFieldContext<MFC>,
  entries: [string, MargaritaFormResolverOutput<OUTPUT>][]
) => {
  if (!entries.length) return Promise.resolve({});
  type ObservableEntry = MargaritaFormResolverEntry<OUTPUT>;
  const observableEntries = entries.reduce((acc, [key, output]) => {
    const longTime = setTimeout(() => {
      console.warn(`${title} is taking long time to finish!`, { context });
    }, context.control.config.asyncFunctionWarningTimeout || 2000);

    if (output instanceof Observable) {
      const observable = output.pipe(
        map((result) => {
          clearTimeout(longTime);
          return [key, result];
        })
      ) as Observable<ObservableEntry>;
      acc.push(observable);
    } else {
      const promise = Promise.resolve(output).then((result) => {
        clearTimeout(longTime);
        return [key, result];
      }) as Promise<ObservableEntry>;
      acc.push(promise);
    }

    return acc;
  }, [] as ObservableInput<ObservableEntry>[]);

  return combineLatest(observableEntries).pipe(
    map((values: ObservableEntry[]) => {
      return Object.fromEntries(values);
    })
  );
};
