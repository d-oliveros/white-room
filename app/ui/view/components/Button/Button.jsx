import PropTypes from 'prop-types';
import { Button as FlowbiteButton } from 'flowbite-react';

const Button = (props) => {
  const flowbiteArgs = { ...props };
  flowbiteArgs.color = props.color || 'blue';

  return (
    <FlowbiteButton {...flowbiteArgs} />
  );
};

Button.propTypes = {
  color: PropTypes.string,
};

export default Button;
