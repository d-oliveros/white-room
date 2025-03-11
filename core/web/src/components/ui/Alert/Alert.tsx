import { Alert as FlowbiteAlert, type AlertProps as FlowbiteAlertProps } from 'flowbite-react';

interface AlertProps extends Omit<FlowbiteAlertProps, 'children'> {
  messageBold?: string;
  message: string;
  color?: FlowbiteAlertProps['color'];
  onDismiss?: () => void;
}

const Alert = ({ messageBold, message, color = 'failure', onDismiss, ...props }: AlertProps) => {
  return (
    <FlowbiteAlert color={color} onDismiss={onDismiss} {...props}>
      {messageBold && <span className="font-medium">{messageBold}&nbsp;</span>}
      {message}
    </FlowbiteAlert>
  );
};

export default Alert;
