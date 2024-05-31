import React from 'react';
import PropTypes from 'prop-types';

import './LoadingSpinner.less';

const LoadingSpinner = ({ width, height }) => (
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

LoadingSpinner.defaultProps = {
  width: 'auto',
  height: 'auto',
};

export default LoadingSpinner;
