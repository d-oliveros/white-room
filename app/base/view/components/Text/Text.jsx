import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import objectOmitUndefined from '#white-room/util/objectOmitUndefined.js';

import './Text.less';

const TEXT_FONT_TYPE_TO_CLASSNAME_MAPPING = {
  'whitney-sc': 'font-whitney-sc',
  whitney: 'font-whitney',
  wsc: 'font-whitney-sc',
  greycliff: 'font-greycliff',
  inherit: 'font-type-inherit',
};

const TEXT_SIZE_TO_CLASSNAME_MAPPING = {
  sm: 'font-sm',
  medium: 'font-medium',
  large: 'font-large',
  larger: 'font-larger',
  xl: 'font-xl',
  '2xl': 'font-2xl',
  inherit: 'font-inherit',
  10: 'font-size-10',
  11: 'font-size-11',
  12: 'font-sm',
  13: 'font-medium',
  14: 'font-size-14',
  16: 'font-large',
  18: 'font-size-18',
  20: 'font-size-20',
  21: 'font-xl',
  22: 'font-size-22',
  23: 'font-size-23',
  24: 'font-size-24',
  26: 'font-size-26',
  28: 'font-size-28',
  30: 'font-size-30',
  31: 'font-size-31',
  32: 'font-size-32',
  36: 'font-size-36',
  40: 'font-size-40',
  48: 'font-size-48',
  50: 'font-size-50',
  64: 'font-size-64',
  80: 'font-size-80',
};

const TEXT_WEIGHT_TO_CLASSNAME_MAPPING = {
  light: 'font-weight-light',
  medium: 'font-weight-medium',
  bold: 'font-weight-bold',
  bolder: 'font-weight-bolder',
  inherit: 'font-weight-inherit',
  400: 'font-weight-light',
  500: 'font-weight-medium',
  600: 'font-weight-bold',
  700: 'font-weight-700',
  800: 'font-weight-bolder',
};

const TEXT_COLOR_TO_CLASSNAME_MAPPING = {
  inherit: 'color-inherit',
  white: 'color-white',
  black: 'color-black',
  blue: 'color-blue',
  blueNavy: 'color-blue-navy',
  blue300: 'color-blue-300',
  blue400: 'color-blue-400',
  blueGreycliff: 'color-blue-greycliff',
  grey: 'color-grey',
  grey200: 'color-grey-200',
  grey300: 'color-grey-300',
  grey400: 'color-grey-400',
  grey500: 'color-grey-500',
  grey600: 'color-grey-600',
  greyDark: 'color-grey-dark',
  greyMonochrome: 'color-grey-monochrome',
  greyMonochromeInactive: 'color-grey-monochrome-inactive',
  red: 'color-red',
  green: 'color-green',
  orange300: 'color-orange-300',
  yellowGold: 'color-yellow-gold',
  yellowSunrise300: 'color-yellow-sunrise-300',
  purpleRoyal: 'color-purple-royal',
  purpleDark: 'color-purple-dark',
  fontBlueDark: 'color-font-blue-dark',
  greenDark: 'color-green-dark',
};

const TEXT_LEADING_TO_CLASSNAME_MAPPING = {
  normal: 'leading-normal',
  20: 'leading-20',
  35: 'leading-35',
  45: 'leading-45',
  '2xl': 'leading-2xl',
};

const TEXT_DISPLAY_TO_CLASSNAME_MAPPING = {
  block: 'display-block',
  none: 'display-none',
};

const TEXT_CURSOR_TO_CLASSNAME_MAPPING = {
  pointer: 'cursor-pointer',
};

const TEXT_DECORATION_TO_CLASSNAME_MAPPING = {
  underline: 'text-decoration-underline',
  'underline-yellow': 'text-decoration-underline-yellow',
  'line-through': 'text-decoration-line-through',
};

const TEXT_TRANSFORM_TO_CLASSNAME_MAPPING = {
  uppercase: 'text-transform-uppercase',
};

const TEXT_ALIGN_TO_CLASSNAME_MAPPING = {
  center: 'text-align-center',
  right: 'text-align-right',
};

const TEXT_WHITE_SPACE_TO_CLASSNAME_MAPPING = {
  nowrap: 'white-space-nowrap',
  prewrap: 'white-space-prewrap',
};

const TEXT_LETTER_SPACING_TO_CLASSNAME_MAPPING = {
  0: 'letter-spacing-0',
  41: 'letter-spacing-41',
};

function Text({
  children,
  align,
  font,
  size,
  weight,
  color,
  leading,
  display,
  cursor,
  decoration,
  transform,
  whiteSpace,
  spacing,
  onClick,
  fontSize,
  fontStyle,
  lineHeight,
  letterSpacing,
  textShadow,
  opacity,
  padding,
  paddingTop,
  paddingBottom,
  paddingRight,
  paddingLeft,
  position,
  textOverflow,
  overflow,
  overflowWrap,
  wordBreak,
  wordWrap,
  verticalAlign,
  ...props
}) {
  return (
    <span
      styleName={classnames(
        'Text',
        TEXT_ALIGN_TO_CLASSNAME_MAPPING[align],
        TEXT_FONT_TYPE_TO_CLASSNAME_MAPPING[font],
        TEXT_SIZE_TO_CLASSNAME_MAPPING[size],
        TEXT_WEIGHT_TO_CLASSNAME_MAPPING[weight],
        TEXT_COLOR_TO_CLASSNAME_MAPPING[color],
        TEXT_LEADING_TO_CLASSNAME_MAPPING[leading],
        TEXT_DISPLAY_TO_CLASSNAME_MAPPING[display],
        TEXT_CURSOR_TO_CLASSNAME_MAPPING[cursor],
        TEXT_DECORATION_TO_CLASSNAME_MAPPING[decoration],
        TEXT_TRANSFORM_TO_CLASSNAME_MAPPING[transform],
        TEXT_WHITE_SPACE_TO_CLASSNAME_MAPPING[whiteSpace],
        TEXT_LETTER_SPACING_TO_CLASSNAME_MAPPING[spacing],
      )}
      onClick={onClick}
      {...props}
    >{children}
    </span>
  );
}

const inlineStyleProp = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

Text.propTypes = {
  children: PropTypes.node,
  align: PropTypes.oneOf(Object.keys(TEXT_ALIGN_TO_CLASSNAME_MAPPING)),
  font: PropTypes.oneOf(Object.keys(TEXT_FONT_TYPE_TO_CLASSNAME_MAPPING)),
  size: PropTypes.oneOf(Object.keys(TEXT_SIZE_TO_CLASSNAME_MAPPING)),
  weight: PropTypes.oneOf(Object.keys(TEXT_WEIGHT_TO_CLASSNAME_MAPPING)),
  color: PropTypes.oneOf(Object.keys(TEXT_COLOR_TO_CLASSNAME_MAPPING)),
  leading: PropTypes.oneOf(Object.keys(TEXT_LEADING_TO_CLASSNAME_MAPPING)),
  display: PropTypes.oneOf(Object.keys(TEXT_DISPLAY_TO_CLASSNAME_MAPPING)),
  cursor: PropTypes.oneOf(Object.keys(TEXT_CURSOR_TO_CLASSNAME_MAPPING)),
  decoration: PropTypes.oneOf(Object.keys(TEXT_DECORATION_TO_CLASSNAME_MAPPING)),
  transform: PropTypes.oneOf(Object.keys(TEXT_TRANSFORM_TO_CLASSNAME_MAPPING)),
  whiteSpace: PropTypes.oneOf(Object.keys(TEXT_WHITE_SPACE_TO_CLASSNAME_MAPPING)),
  spacing: PropTypes.oneOf(Object.keys(TEXT_LETTER_SPACING_TO_CLASSNAME_MAPPING)),
  opacity: inlineStyleProp,
  fontSize: inlineStyleProp,
  fontStyle: inlineStyleProp,
  lineHeight: inlineStyleProp,
  letterSpacing: inlineStyleProp,
  textShadow: inlineStyleProp,
  padding: inlineStyleProp,
  paddingTop: inlineStyleProp,
  paddingRight: inlineStyleProp,
  paddingLeft: inlineStyleProp,
  paddingBottom: inlineStyleProp,
  position: inlineStyleProp,
  overflowWrap: inlineStyleProp,
  onClick: PropTypes.func,
};

export default Text;
