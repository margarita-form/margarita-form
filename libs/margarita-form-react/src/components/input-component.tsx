import { MargaritaFormControl, MargaritaFormField } from '@margarita-form/core';
import { InputHTMLAttributes } from 'react';

interface InputComponentProps<
  VALUE = unknown,
  VIELD extends MargaritaFormField = MargaritaFormField
> extends InputHTMLAttributes<HTMLInputElement> {
  control: MargaritaFormControl<VALUE, VIELD>;
}

export const Input = ({ control, ...rest }: InputComponentProps) => {
  return <input ref={control.setRef} {...rest} />;
};
