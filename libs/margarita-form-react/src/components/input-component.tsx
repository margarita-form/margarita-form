import type { MFF, MargaritaFormControl } from '@margarita-form/core/light';
import { InputHTMLAttributes } from 'react';

interface InputComponentProps<FIELD extends MFF = MFF> extends InputHTMLAttributes<HTMLInputElement> {
  control: MargaritaFormControl<FIELD>;
}

export const Input = ({ control, ...rest }: InputComponentProps) => {
  return <input {...rest} ref={control.setRef} />;
};
