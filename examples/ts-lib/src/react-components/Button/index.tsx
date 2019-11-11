import { Button as AntdButton } from 'antd'; // just for testing tsCustomTransformers
import * as React from 'react';

const Button: React.SFC<{
  className?: string;
  onClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}> = props => {
  const { className = '', children, onClick = () => void 0 } = props;
  return (
    <>
      <button className={`ts-lib-react-button ${className}`} onClick={onClick}>
        {children}
      </button>
      <AntdButton>{children}</AntdButton>
    </>
  );
};

export default Button;
