import React from 'react';
import PropTypes from 'prop-types';

const CardContainer = ({
  children,
  onCardClicked,
}) => (
  <div
    className='CardContainer'
    onClick={onCardClicked}
  >
    {children}
  </div>
);

CardContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  onCardClicked: PropTypes.func,
};

export default CardContainer;
