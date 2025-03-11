import { Button as FlowbiteButton, type ButtonProps as FlowbiteButtonProps } from 'flowbite-react';

interface ButtonProps extends FlowbiteButtonProps {
  icon?: React.ReactNode;
}

const Button = ({ color = 'blue', children, icon, ...props }: ButtonProps) => {
  return (
    <FlowbiteButton color={color} {...props}>
      {icon ? (
        <div className="flex items-center gap-x-3">
          {icon}
          {children}
        </div>
      ) : (
        children
      )}
    </FlowbiteButton>
  );
};

export default Button;
