import { combineLatest, map, Observable, ObservableInput } from 'rxjs';
import { MargaritaFormFieldContext, MargaritaFormResolverOutput, MFC } from '../margarita-form-types';

type MargaritaFormResolverEntry<OUTPUT = unknown> = [string, OUTPUT];

export const mapResolverEntries = <OUTPUT = unknown>(
  title: string,
  from: Record<string, unknown>,
  context: MargaritaFormFieldContext,
  resolveStaticValues = true
) => {
  if (!from) return Promise.resolve({});
  const entries = Object.entries(from).reduce((acc, [key, param]) => {
    if (typeof param === 'function') {
      const result = param(context);
      acc.push([key, result]);
      return acc;
    }

    const resolverFn = context.control.resolvers[key];
    if (typeof resolverFn === 'function') {
      const result = resolverFn({ ...context, params: param });
      acc.push([key, result]);
      return acc;
    }
    if (resolveStaticValues) acc.push([key, param as OUTPUT]);
    return acc;
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
    }, context.control.form.config.asyncFunctionWarningTimeout || 2000);

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
