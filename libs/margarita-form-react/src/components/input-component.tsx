import {
  MargaritaFormControlTypes,
  MargaritaFormField,
} from '@margarita-form/core';
import { InputHTMLAttributes } from 'react';

interface InputComponentProps<
  T = unknown,
  F extends MargaritaFormField = MargaritaFormField
> extends InputHTMLAttributes<HTMLInputElement> {
  control: MargaritaFormControlTypes<T, F>;
}

export const Input = ({ control, ...rest }: InputComponentProps) => {
  return <input ref={control.setRef} {...rest} />;
};