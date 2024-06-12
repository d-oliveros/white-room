import React from 'react';
import PropTypes from 'prop-types';

import './LoadingSpinner.less';

const LoadingSpinner = ({
  width = 'auto',
  height = 'auto',
}) => (
  <img
    styleName='LoadingSpinner'
    alt='loading spinner'
    src='/images/loading-spinner-white.svg'
    width={width}
    height={height}
  />
);

LoadingSpinner.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};

export default LoadingSpinner;
