import { distinctUntilChanged, fromEvent, map } from 'rxjs';
import type {
  MargaritaFormBaseElement,
  MargaritaFormControl,
  MargaritaFormField,
} from '../../margarita-form-types';

export const handleElementBlur = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
}) => {
  return fromEvent<InputEvent>(node, 'blur').subscribe(() => {
    control.updateStateValue('touched', true);
    control.updateStateValue('focus', false);
  });
};

export const handleElementFocus = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
}) => {
  return fromEvent<InputEvent>(node, 'focus').subscribe(() => {
    control.updateStateValue('focus', true);
  });
};

export const handleControlDisable = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
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

export const handleControlReadonly = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
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
