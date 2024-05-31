import React from 'react';
import PropTypes from 'prop-types';

import './FlexRow.less';

const FlexRow = ({
  children,
  width,
  marginTop,
  className,
}) => {
  return (
    <div
      className={className}
      styleName='FlexRow'
      style={{ width, marginTop }}
    >
      {children}
    </div>
  );
};

FlexRow.propTypes = {
  children: PropTypes.node,
  width: PropTypes.string,
  className: PropTypes.string,
};

FlexRow.defaultProps = {
  width: '100%',
};

export default FlexRow;
