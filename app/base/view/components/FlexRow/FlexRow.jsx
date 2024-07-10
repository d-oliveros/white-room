import React from 'react';
import PropTypes from 'prop-types';

import './FlexRow.less';

const FlexRow = ({
  children,
  width = '100%',
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

export default FlexRow;
