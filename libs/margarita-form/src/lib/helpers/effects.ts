import { debounceTime, filter, startWith, switchMap } from 'rxjs';
import { MFC, MargaritaFormControlContext, MargaritaFormResolverOutput } from '../margarita-form-types';
import { checkAsync } from './async-checks';

type EffectCallback<VALUE = unknown> = (context: MargaritaFormControlContext) => MargaritaFormResolverOutput<VALUE>;
type Unsubscribe = () => void;

export const fromChanges = <CONTROL extends MFC, VALUE = unknown>(
  control: CONTROL,
  changeName: string,
  callback: EffectCallback<VALUE>
) => {
  return control.changes.pipe(
    filter((change) => change.name === changeName),
    startWith(null),
    debounceTime(control?.config?.afterChangesDebounceTime || 10),
    switchMap(() => {
      const context = control.generateContext();
      const result = callback(context);
      const resultIsAsync = checkAsync(result);
      return resultIsAsync ? (result as any) : Promise.resolve(result);
    })
  );
};

export const onChanges = <CONTROL extends MFC, VALUE = void>(
  control: CONTROL,
  changeName: string,
  callback: EffectCallback<VALUE>
): Unsubscribe => {
  const subscription = fromChanges(control, changeName, callback).subscribe();
  return () => subscription.unsubscribe();
};

/* Value changes */

export const fromValueChange = <CONTROL extends MFC, VALUE = unknown>(control: CONTROL, callback: EffectCallback<VALUE>) => {
  return fromChanges(control, 'value', callback);
};

export const onValueChange = <CONTROL extends MFC, VALUE = void>(control: CONTROL, callback: EffectCallback<VALUE>): Unsubscribe => {
  const subscription = fromValueChange(control, callback).subscribe();
  return () => subscription.unsubscribe();
};

/* State changes */

export const fromStateChange = <CONTROL extends MFC, VALUE = unknown>(control: CONTROL, callback: EffectCallback<VALUE>) => {
  return fromChanges(control, 'state', callback);
};

export const onStateChange = <CONTROL extends MFC, VALUE = void>(control: CONTROL, callback: EffectCallback<VALUE>): Unsubscribe => {
  const subscription = fromStateChange(control, callback).subscribe();
  return () => subscription.unsubscribe();
};

/* Params changes */

export const fromParamsChange = <CONTROL extends MFC, VALUE = unknown>(control: CONTROL, callback: EffectCallback<VALUE>) => {
  return fromChanges(control, 'params', callback);
};

export const onParamsChange = <CONTROL extends MFC, VALUE = void>(control: CONTROL, callback: EffectCallback<VALUE>): Unsubscribe => {
  const subscription = fromParamsChange(control, callback).subscribe();
  return () => subscription.unsubscribe();
};

/* Controls changes */

export const fromControlsChange = <CONTROL extends MFC, VALUE = unknown>(control: CONTROL, callback: EffectCallback<VALUE>) => {
  return fromChanges(control, 'controls', callback);
};

export const onControlsChange = <CONTROL extends MFC, VALUE = void>(control: CONTROL, callback: EffectCallback<VALUE>): Unsubscribe => {
  const subscription = fromControlsChange(control, callback).subscribe();
  return () => subscription.unsubscribe();
};
