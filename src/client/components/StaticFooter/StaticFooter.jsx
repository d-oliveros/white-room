import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const STATIC_FOOTER_SIZE_TO_CLASSNAME_MAPPING = {
  135: 'size-135',
  '135-105': 'size-135 size-105',
};

const StaticFooter = ({ children, size }) => {
  return (
    <div
      className={classnames(
        'StaticFooter',
        STATIC_FOOTER_SIZE_TO_CLASSNAME_MAPPING[size],
      )}
    >
      {children}
    </div>
  );
};

StaticFooter.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(Object.keys(STATIC_FOOTER_SIZE_TO_CLASSNAME_MAPPING)),
};

export default StaticFooter;
