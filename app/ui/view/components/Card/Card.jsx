import PropTypes from 'prop-types';
import { Card as FlowbiteCard } from 'flowbite-react';

const Card = ({ href, children }) => {
  return (
    <FlowbiteCard href={href} className="max-w-sm">
      {children}
    </FlowbiteCard>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
};

export default Card;
