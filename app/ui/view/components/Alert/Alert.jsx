import PropTypes from 'prop-types';
import { Alert as FlowbiteAlert } from 'flowbite-react';

const Alert = ({ messageBold, message, color = 'failure', onDismiss }) => {
  return (
    <FlowbiteAlert color={color} onDismiss={onDismiss}>
      {messageBold &&
        <span className="font-medium">
          {messageBold}&nbsp;
        </span>
      }
      {message}
    </FlowbiteAlert>
  );
};

Alert.propTypes = {
  messageBold: PropTypes.string,
  message: PropTypes.string,
  color: PropTypes.string,
  onDismiss: PropTypes.func,
};

export default Alert;
