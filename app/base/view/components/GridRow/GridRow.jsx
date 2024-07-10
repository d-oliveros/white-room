import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './GridRow.less';

const GridRow = ({
  autofit,
  autofitMinColumnWidth,
  children,
  columns,
  width,
  columnGap,
  rowGap,
  maxWidth,
  columnWrapMobile,
  columnWrapTablet,
  className,
}) => {
  return (
    <div
      className={className}
      styleName={classnames(
        'GridRow',
        columnWrapMobile ? 'columnWrapMobile' : null,
        columnWrapTablet ? 'columnWrapTablet' : null
      )}
      style={{
        gridTemplateColumns:
          autofit ?
            `repeat(auto-fit, minmax(${autofitMinColumnWidth}, ${autofitMinColumnWidth}))` :
            `repeat(${columns}, 1fr)`,
        width: autofit ? 'auto' : width,
        columnGap,
        rowGap,
        maxWidth,
      }}
    >
      {children}
    </div>
  );
};

GridRow.propTypes = {
  autofit: PropTypes.bool,
  autofitMinColumnWidth: PropTypes.string,
  children: PropTypes.node,
  columns: PropTypes.number,
  width: PropTypes.string,
  columnGap: PropTypes.string,
  rowGap: PropTypes.string,
  maxWidth: PropTypes.string,
  columnWrapMobile: PropTypes.bool,
  className: PropTypes.string,
};

GridRow.defaultProps = {
  autofit: false,
  autofitMinColumnWidth: '250px',
  columns: 1,
  width: '100%',
  maxWidth: '900px',
  columnGap: '35px',
  columnWrapMobile: true,
};

export default GridRow;
