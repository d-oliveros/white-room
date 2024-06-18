import React from 'react';
import PropTypes from 'prop-types';

const BackButton = ({
  onClick,
}) => (
  <div
    className='link back'
    onClick={onClick}
  />
);

BackButton.propTypes = {
  onClick: PropTypes.func,
};

export default BackButton;
