import { combineLatest, map, Observable, ObservableInput } from 'rxjs';
import {
  MargaritaFormFieldContext,
  MargaritaFormFieldFunctionOutput,
  MargaritaFormFieldFunctionOutputResultEntry,
} from '../margarita-form-types';

export const resolveFunctionOutputs = <T = unknown>(
  title: string,
  context: MargaritaFormFieldContext,
  entries: [string, MargaritaFormFieldFunctionOutput<T>][]
) => {
  type ObservableEntry = MargaritaFormFieldFunctionOutputResultEntry<T>;
  const observableEntries = entries.reduce((acc, [key, output]) => {
    const longTime = setTimeout(() => {
      console.warn(`${title} is taking long time to finish!`, { context });
    }, 2000);

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
