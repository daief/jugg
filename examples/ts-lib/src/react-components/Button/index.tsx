import * as React from 'react';

const Button: React.SFC<{
  className?: string;
  onClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}> = props => {
  const { className = '', children, onClick = () => void 0 } = props;
  return (
    <button className={`ts-lib-react-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
