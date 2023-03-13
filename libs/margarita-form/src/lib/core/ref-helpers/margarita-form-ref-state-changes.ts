import { distinctUntilChanged, fromEvent, map } from 'rxjs';
import type {
  MargaritaFormBaseElement,
  MargaritaFormControlTypes,
} from '../../margarita-form-types';

export const handleElementBlur = ({
  node,
  control,
}: {
  node: MargaritaFormBaseElement;
  control: MargaritaFormControlTypes;
}) => {
  return fromEvent<InputEvent>(node, 'blur').subscribe(() => {
    control.updateStateValue('touched', true);
    control.updateStateValue('focus', false);
  });
};

export const handleElementFocus = ({
  node,
  control,
}: {
  node: MargaritaFormBaseElement;
  control: MargaritaFormControlTypes;
}) => {
  return fromEvent<InputEvent>(node, 'focus').subscribe(() => {
    control.updateStateValue('focus', true);
  });
};

export const handleControlDisable = ({
  node,
  control,
}: {
  node: MargaritaFormBaseElement;
  control: MargaritaFormControlTypes;
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
