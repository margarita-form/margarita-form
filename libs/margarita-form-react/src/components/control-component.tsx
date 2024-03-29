import type { MFC, MFGF } from '@margarita-form/core/light';
import { ControlProvider } from '../providers/control/control-provider';
import { HTMLAttributes, createElement, Fragment } from 'react';
import { useGetOrAddControl } from '../hooks/use-get-or-add-control';

interface WithControl {
  control: MFC<MFGF>;
}

interface WithField {
  field: MFGF;
}

type WithControlOrSchema = WithControl | WithField;
type AddWrapper = { addWrapper?: false | 'string' };
type ControlComponentProps = HTMLAttributes<HTMLElement> & WithControlOrSchema & AddWrapper;

export const Control = (props: ControlComponentProps) => {
  if ('field' in props) {
    return <CreateControl {...props} />;
  }

  if ('control' in props) {
    const { control, children, addWrapper = 'div', ...attr } = props;
    if (addWrapper) {
      const Wrapper = () => createElement(addWrapper);
      return (
        <ControlProvider control={control}>
          <Wrapper {...attr}>{children}</Wrapper>
        </ControlProvider>
      );
    }
    return (
      <ControlProvider control={control}>
        <Fragment>{children}</Fragment>
      </ControlProvider>
    );
  }

  throw 'No control or field provided as prop for the <Control>';
};

type CreateFormProps = HTMLAttributes<HTMLFormElement> & WithField;

const CreateControl = ({ field, ...rest }: CreateFormProps) => {
  const control = useGetOrAddControl(field);
  if (!control) throw 'No control found and control could not be created!';
  return <ControlElement control={control} {...rest} />;
};

type ControlElementProps = HTMLAttributes<HTMLFormElement> & WithControl & AddWrapper;

export const ControlElement = (props: ControlElementProps) => {
  const { control, children, addWrapper = 'div', ...attr } = props;
  if (addWrapper) {
    const Wrapper = () => createElement(addWrapper);
    return (
      <ControlProvider control={control}>
        <Wrapper {...attr}>{children}</Wrapper>
      </ControlProvider>
    );
  }
  return (
    <ControlProvider control={control}>
      <Fragment>{children}</Fragment>
    </ControlProvider>
  );
};
