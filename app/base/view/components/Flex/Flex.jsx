import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Box from '#base/view/components/Box/Box.jsx';
import './Flex.less';

const FLEX_DIRECTION_TO_CLASSNAME_MAPPING = {
  row: 'flex-row',
  rowReverse: 'flex-row-reverse',
  col: 'flex-col',
  colReverse: 'flex-col-reverse',
};

const FLEX_JUSTIFY_TO_CLASSNAME_MAPPING = {
  start: 'flex-start',
  end: 'flex-end',
  between: 'flex-between',
  around: 'flex-around',
  center: 'flex-justify-center',
};

const FLEX_ALIGN_TO_CLASSNAME_MAPPING = {
  stretch: 'flex-align-stretch',
  start: 'flex-align-start',
  end: 'flex-align-end',
  center: 'flex-align-center',
  baseline: 'flex-align-baseline',
};

const FLEX_WRAP_TO_CLASSNAME_MAPPING = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
};

function Flex({
  children,
  direction = 'row',
  justify,
  align,
  wrap,
  ..._styles
}) {
  return (
    <Box
      styleName={classnames(
        'Flex',
        FLEX_DIRECTION_TO_CLASSNAME_MAPPING[direction],
        FLEX_JUSTIFY_TO_CLASSNAME_MAPPING[justify],
        FLEX_ALIGN_TO_CLASSNAME_MAPPING[align],
        FLEX_WRAP_TO_CLASSNAME_MAPPING[wrap],
      )}
      {..._styles}
    >
      {children}
    </Box>
  );
}

Flex.propTypes = {
  ...Box.propTypes,
  direction: PropTypes.oneOf(Object.keys(FLEX_DIRECTION_TO_CLASSNAME_MAPPING)),
  justify: PropTypes.oneOf(Object.keys(FLEX_JUSTIFY_TO_CLASSNAME_MAPPING)),
  align: PropTypes.oneOf(Object.keys(FLEX_ALIGN_TO_CLASSNAME_MAPPING)),
  wrap: PropTypes.oneOf(Object.keys(FLEX_WRAP_TO_CLASSNAME_MAPPING)),
};

export default Flex;
