import { combineLatest, firstValueFrom, map, Observable, ObservableInput } from 'rxjs';
import {
  MargaritaFormFieldContext,
  MargaritaFormResolverOutput,
  MargaritaFormResolvers,
  MFC,
  ResolverParams,
} from '../margarita-form-types';

type MargaritaFormResolverEntry<OUTPUT = unknown> = [string, OUTPUT];

const ResolverParamKeys: (keyof ResolverParams)[] = ['name', 'params'];

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
  resolvers?: MargaritaFormResolvers;
}) => {
  if (!from) return Promise.resolve({});
  const entries = Object.entries(from).reduce((acc, [key, value]) => {
    if (!value) return acc;

    if (typeof value === 'function') {
      const result = value(context);
      acc.push([key, result]);
      return acc;
    }

    const getResolver = ({ name, params, ...rest }: ResolverParams) => {
      const resolverFn = resolvers[name];
      if (typeof resolverFn === 'function') {
        const result = resolverFn({ ...context, params, ...rest });
        acc.push([key, result]);
        return acc;
      }
      if (resolveStaticValues) acc.push([key, params as OUTPUT]);
      return acc;
    };

    const stringConfig = typeof value === 'string' && /\$\$([^:]+):?([^:]+)?:?([^:]+)/gi.exec(value);
    if (stringConfig) {
      const [fullMatch, name, params, ...data] = stringConfig;
      const rest = Object.fromEntries(data.map((item) => item.split(':')));
      return getResolver({ name, params, ...rest });
    }

    const isResolverConfigObject = () => {
      const isObject = typeof value === 'object';
      if (!isObject) return null;
      const keys = Object.keys(value);
      const hasResolverName = keys.includes('name');
      if (!hasResolverName) return null;
      const keysAreValid = ResolverParamKeys.every((key) => keys.includes(key as string));
      if (!keysAreValid) return null;
      return value as ResolverParams;
    };

    const objectConfig = isResolverConfigObject();
    if (objectConfig) {
      return getResolver(objectConfig);
    }

    return getResolver({ name: key, params: value });
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

export const resolveFunctionOutputPromises = async <OUTPUT = unknown>(
  title: string,
  context: MargaritaFormFieldContext<MFC>,
  entries: MargaritaFormResolverOutput<OUTPUT> | Record<string, MargaritaFormResolverOutput<OUTPUT>>
): Promise<OUTPUT> => {
  if (typeof entries === 'function') return resolveFunctionOutputPromises(title, context, { [title]: entries });
  const observables = mapResolverEntries({ title, context, from: entries as Record<string, MargaritaFormResolverOutput<OUTPUT>> });
  if (observables instanceof Promise) return observables as Promise<OUTPUT>;
  const promises = await firstValueFrom(observables);
  return promises as OUTPUT;
};

export const createResolverContext = <CONTROL extends MFC>(control: CONTROL): MargaritaFormFieldContext<CONTROL> => {
  return {
    control,
    value: control.value,
    params: undefined,
  };
};
