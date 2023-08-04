import type { MFF, MargaritaFormControl } from '@margarita-form/core';
import { InputHTMLAttributes } from 'react';

interface InputComponentProps<FIELD extends MFF = MFF> extends InputHTMLAttributes<HTMLInputElement> {
  control: MargaritaFormControl<FIELD>;
}

export const Input = ({ control, ...rest }: InputComponentProps) => {
  return <input ref={control.setRef} {...rest} />;
};
