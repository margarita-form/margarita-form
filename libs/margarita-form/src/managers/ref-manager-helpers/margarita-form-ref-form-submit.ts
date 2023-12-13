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

export const handleFormElementFormData = <CONTROL extends MFC = MFC>({
  node,
  control,
}: {
  node: MargaritaFormBaseElement<CONTROL>;
  control: CONTROL;
}) => {
  const isForm = node instanceof HTMLFormElement;
  if (!isForm) return null;
  return fromEvent<FormDataEvent>(node, 'formdata').subscribe(({ formData }) => {
    const appendFormData = (formData: FormData, obj: any, parentKey?: string) => {
      if (!obj) return;
      if (typeof obj === 'object')
        Object.entries(obj).forEach(([key, value]) => {
          const newKey = parentKey ? `${parentKey}[${key}]` : key;
          appendFormData(formData, value, newKey);
        });
      else if (parentKey) formData.set(parentKey, obj);
    };
    appendFormData(formData, control.value);
  });
};
