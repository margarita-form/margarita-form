import { fromEvent } from 'rxjs';
import { MFC, MargaritaFormBaseElement } from '../../margarita-form-types';

export const handleFormElementSubmit = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  const isForm = node instanceof HTMLFormElement;
  if (!isForm) return null;
  return fromEvent<SubmitEvent>(node, 'submit').subscribe((e) => {
    e.preventDefault();
    control.submit();
  });
};

export const handleFormElementReset = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  const isForm = node instanceof HTMLFormElement;
  if (!isForm) return null;
  return fromEvent<SubmitEvent>(node, 'reset').subscribe((e) => {
    e.preventDefault();
    control.reset();
  });
};
