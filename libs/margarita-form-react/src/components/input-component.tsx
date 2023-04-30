import { MFF, MargaritaFormControl } from '@margarita-form/core';
import { InputHTMLAttributes } from 'react';

interface InputComponentProps<VALUE = unknown, FIELD extends MFF<FIELD> = MFF> extends InputHTMLAttributes<HTMLInputElement> {
  control: MargaritaFormControl<VALUE, FIELD>;
}

export const Input = ({ control, ...rest }: InputComponentProps) => {
  return <input ref={control.setRef} {...rest} />;
};
