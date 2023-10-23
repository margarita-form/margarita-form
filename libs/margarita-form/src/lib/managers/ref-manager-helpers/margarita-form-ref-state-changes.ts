import { combineLatest, distinctUntilChanged, fromEvent, map, switchMap } from 'rxjs';
import type { MFC, MargaritaFormBaseElement } from '../../margarita-form-types';
import { getResolverOutputMapObservable, getResolverOutputMapSyncronous } from '../../helpers/resolve-function-outputs';

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
  const { attributes } = control.field;
  if (!attributes) return;

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

  const syncronousAttributes = getResolverOutputMapSyncronous(attributes, control);

  setAttributes(syncronousAttributes);

  return combineLatest([control.valueChanges, control.stateChanges])
    .pipe(switchMap(() => getResolverOutputMapObservable(attributes, control)))
    .subscribe(setAttributes);
};
