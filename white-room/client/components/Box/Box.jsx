import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const BOX_BG_COLOR_TO_CLASSNAME_MAPPING = {
  red: 'bg-color-red',
  red200: 'bg-color-red-200',
  orange200: 'bg-color-orange-200',
  orange300: 'bg-color-orange-300',
  'yellow-lighter': 'bg-color-yellow-lighter',
  green: 'bg-color-green',
  'green-lighter': 'bg-color-green-lighter',
  'grey-fill-light': 'bg-grey-fill-light',
  white: 'bg-color-white',
  grey100: 'bg-color-grey-100',
  grey200: 'bg-color-grey-200',
  grey300: 'bg-color-grey-300',
  blueLight10: 'bg-color-blue-light-10',
  blue300: 'bg-color-blue-300',
};

const BOX_POSITION_TO_CLASSNAME_MAPPING = {
  relative: 'position-relative',
  absolute: 'position-absolute',
  fixed: 'position-fixed',
  sticky: 'position-sticky',
  initial: 'position-initial',
};

const BOX_BG_REPEAT_TO_CLASSNAME_MAPPING = {
  no: 'bg-repeat-no',
};

const BOX_DISPLAY_TO_CLASSNAME_MAPPING = {
  inlineBlock: 'display-inline-block',
  contents: 'display-inline-contents',
  grid: 'display-grid',
  none: 'display-none',
  block: 'display-block',
  flex: 'display-flex',
};

const Box = forwardRef(({
  children,
  className,
  bgColor,
  bgRepeat,
  display,
  position,
  onClick,
  id,
}, ref) => {
  return (
    <div
      ref={ref}
      id={id}
      className={classnames(
        'Box',
        BOX_BG_COLOR_TO_CLASSNAME_MAPPING[bgColor],
        BOX_BG_REPEAT_TO_CLASSNAME_MAPPING[bgRepeat],
        BOX_DISPLAY_TO_CLASSNAME_MAPPING[display],
        BOX_POSITION_TO_CLASSNAME_MAPPING[position],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

const inlineStyleProp = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

Box.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  bgColor: PropTypes.oneOf(Object.keys(BOX_BG_COLOR_TO_CLASSNAME_MAPPING)),
  bgRepeat: PropTypes.oneOf(Object.keys(BOX_BG_REPEAT_TO_CLASSNAME_MAPPING)),
  display: PropTypes.oneOf(Object.keys(BOX_DISPLAY_TO_CLASSNAME_MAPPING)),
  position: PropTypes.oneOf(Object.keys(BOX_POSITION_TO_CLASSNAME_MAPPING)),
  width: inlineStyleProp,
  top: inlineStyleProp,
  left: inlineStyleProp,
  right: inlineStyleProp,
  margin: inlineStyleProp,
  marginTop: inlineStyleProp,
  marginBottom: inlineStyleProp,
  marginRight: inlineStyleProp,
  marginLeft: inlineStyleProp,
  borderRadius: inlineStyleProp,
  gap: inlineStyleProp,
  backgroundImage: PropTypes.string,
  id: PropTypes.string,
};

export default Box;
