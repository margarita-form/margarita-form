import { MFC } from '@margarita-form/core';
import styled from 'styled-components';

interface ControlErrorProps {
  control: MFC;
}

const ErrorWrapper = styled.p`
  color: red;
  margin: 0;
  font-size: 14px;
  span:not(:last-child) {
    margin-right: 10px;
  }
`;

export const ControlError = ({ control }: ControlErrorProps) => {
  const { shouldShowError, errors } = control.state;
  if (!shouldShowError) return null;

  return (
    <ErrorWrapper>
      {Object.values(errors).map((error, i) => {
        return <span key={i}>{error as string}</span>;
      })}
    </ErrorWrapper>
  );
};
