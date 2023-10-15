import { Observable, combineLatest, debounceTime, distinctUntilChanged, fromEvent, map, switchMap } from 'rxjs';
import type { MFC, MargaritaFormBaseElement } from '../../margarita-form-types';
import { mapResolverEntries } from '../../helpers/resolve-function-outputs';

export const handleElementBlur = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  return fromEvent<InputEvent>(node, 'blur').subscribe(() => {
    control.updateState({ touched: true, focus: false });
  });
};

export const handleElementFocus = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  return fromEvent<InputEvent>(node, 'focus').subscribe(() => {
    control.updateStateValue('focus', true);
  });
};

export const handleControlDisable = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  return control.stateChanges
    .pipe(
      map((state) => state.disabled),
      distinctUntilChanged()
    )
    .subscribe((disabled) => {
      node.disabled = disabled;
    });
};

export const handleControlReadonly = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  return control.stateChanges
    .pipe(
      map((state) => state.readOnly),
      distinctUntilChanged()
    )
    .subscribe((readOnly) => {
      node.readOnly = readOnly;
    });
};

export const handleControlAttributeChanges = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  const setAttributes = (attributes: Record<string, unknown>) => {
    try {
      const el = node as HTMLElement;
      Object.entries(attributes).forEach(([key, value]) => {
        el.setAttribute(key, String(value));
      });
    } catch (error) {
      // Could not set attributes!
      console.error('Could not set attributes!', {
        attributes,
        control,
        error,
      });
    }
  };

  const syncronousAttributes = Object.entries(control.field.attributes || {}).reduce((acc, [key, value]) => {
    if (typeof value === 'function') return acc;
    if (value instanceof Promise) return acc;
    if (value instanceof Observable) return acc;
    acc[key] = value;
    return acc;
  }, {} as Record<string, unknown>);

  setAttributes(syncronousAttributes);

  return combineLatest([control.valueChanges, control.stateChanges])
    .pipe(
      debounceTime(1),
      switchMap(([value]) => {
        return mapResolverEntries({
          title: 'Attributes',
          from: control.field.attributes || {},
          context: {
            control,
            value,
            params: null,
          },
        });
      })
    )
    .subscribe(setAttributes);
};
