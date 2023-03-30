import { fromEvent } from 'rxjs';
import {
  MargaritaFormBaseElement,
  MargaritaFormControl,
  MargaritaFormField,
} from '../../margarita-form-types';

export const handleFormElementSubmit = <
  F extends MargaritaFormField = MargaritaFormField
>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<F>;
  control: MargaritaFormControl<unknown, F>;
}) => {
  const isForm = node instanceof HTMLFormElement;
  if (!isForm) return null;
  return fromEvent<SubmitEvent>(node, 'submit').subscribe((e) => {
    e.preventDefault();
    control.root.submit();
  });
};
