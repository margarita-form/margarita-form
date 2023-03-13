import { fromEvent } from 'rxjs';
import {
  MargaritaFormBaseElement,
  MargaritaFormControlTypes,
} from '../../margarita-form-types';

export const handleFormElementSubmit = ({
  node,
  control,
}: {
  node: MargaritaFormBaseElement;
  control: MargaritaFormControlTypes;
}) => {
  const isForm = node instanceof HTMLFormElement;
  if (!isForm) return null;
  return fromEvent<SubmitEvent>(node, 'submit').subscribe((e) => {
    e.preventDefault();
    control.root.submit();
  });
};
