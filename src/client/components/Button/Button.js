import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './Button.less';

import Box from 'client/components/Box/Box';
import Flex from 'client/components/Flex/Flex';

export const BUTTON_THEME_ADOBE_YELLOW_TENANT_SCREENING_LISTING = 'BUTTON_THEME_ADOBE_YELLOW_TENANT_SCREENING_LISTING'; // eslint-disable-line max-len
export const BUTTON_THEME_ADOBE_BLUE_PROPERTY_DOCS = 'BUTTON_THEME_ADOBE_BLUE_PROPERTY_DOCS';
export const BUTTON_THEME_ADOBE_BLUE_BORDER_PROPERTY_DOCS = 'BUTTON_THEME_ADOBE_BLUE_BORDER_PROPERTY_DOCS'; // eslint-disable-line max-len
export const BUTTON_THEME_ADOBE_YELLOW = 'BUTTON_THEME_ADOBE_YELLOW';
export const BUTTON_THEME_ADOBE_BLUE = 'BUTTON_THEME_ADOBE_BLUE';
export const BUTTON_THEME_ADOBE_BLUE_INVERTED = 'BUTTON_THEME_ADOBE_BLUE_INVERTED';
export const BUTTON_THEME_ADOBE_BLUE_OUTLINE = 'BUTTON_THEME_ADOBE_BLUE_OUTLINE';
export const BUTTON_THEME_ADOBE_BLUE_DARK_NAVY = 'BUTTON_THEME_ADOBE_BLUE_DARK_NAVY';
export const BUTTON_THEME_ADOBE_BLUE_DARK_NAVY_OUTLINE = 'BUTTON_THEME_ADOBE_BLUE_DARK_NAVY_OUTLINE';
export const BUTTON_THEME_ADOBE_GREEN = 'BUTTON_THEME_ADOBE_GREEN';
export const BUTTON_THEME_ADOBE_GREY = 'BUTTON_THEME_ADOBE_GREY';
export const BUTTON_THEME_ADOBE_RED = 'BUTTON_THEME_ADOBE_RED';
export const BUTTON_THEME_ADOBE_ORANGE_INVERTED = 'BUTTON_THEME_ADOBE_ORANGE_INVERTED';
export const BUTTON_THEME_ADOBE_RED_INVERTED = 'BUTTON_THEME_ADOBE_RED_INVERTED';
export const BUTTON_THEME_ADOBE_RED_OUTLINE = 'BUTTON_THEME_ADOBE_RED_OUTLINE';
export const BUTTON_THEME_ADOBE_WHITE = 'BUTTON_THEME_ADOBE_WHITE';
export const BUTTON_THEME_ADOBE_WHITE_BLUE_BORDER = 'BUTTON_THEME_ADOBE_WHITE_BLUE_BORDER';
export const BUTTON_THEME_ADOBE_BLUE_BORDER = 'BUTTON_THEME_ADOBE_BLUE_BORDER';
export const BUTTON_THEME_ADOBE_TRANSPARENT_BLUE_BORDER = 'BUTTON_THEME_ADOBE_TRANSPARENT_BLUE_BORDER';
export const BUTTON_THEME_ADOBE_TRANSPARENT_RED_BORDER = 'BUTTON_THEME_ADOBE_TRANSPARENT_RED_BORDER';
export const BUTTON_THEME_BLUR = 'BUTTON_THEME_BLUR';
export const BUTTON_THEME_ASSEMBLY_LINE_BLUE = 'BUTTON_THEME_ASSEMBLY_LINE_BLUE';
export const BUTTON_THEME_TRANSPARENT = 'BUTTON_THEME_TRANSPARENT';

const BUTTON_THEME_TO_CLASSNAME_MAPPING = {
  [BUTTON_THEME_ADOBE_YELLOW]: 'adobe-yellow',
  [BUTTON_THEME_ADOBE_YELLOW_TENANT_SCREENING_LISTING]: 'adobe-yellow-tenant-screening-listing',
  [BUTTON_THEME_ADOBE_BLUE_PROPERTY_DOCS]: 'adobe-blue-property-docs',
  [BUTTON_THEME_ADOBE_BLUE_BORDER_PROPERTY_DOCS]: 'adobe-blue-border-property-docs',
  [BUTTON_THEME_ADOBE_BLUE]: 'adobe-blue',
  [BUTTON_THEME_ADOBE_BLUE_INVERTED]: 'adobe-blue-inverted',
  [BUTTON_THEME_ADOBE_BLUE_OUTLINE]: 'adobe-blue-outline',
  [BUTTON_THEME_ADOBE_BLUE_DARK_NAVY]: 'adobe-blue-dark-navy',
  [BUTTON_THEME_ADOBE_BLUE_DARK_NAVY_OUTLINE]: 'adobe-blue-dark-navy-outline',
  [BUTTON_THEME_ADOBE_GREEN]: 'adobe-green',
  [BUTTON_THEME_ADOBE_GREY]: 'adobe-grey',
  [BUTTON_THEME_ADOBE_RED]: 'adobe-red',
  [BUTTON_THEME_ADOBE_ORANGE_INVERTED]: 'adobe-orange-inverted',
  [BUTTON_THEME_ADOBE_RED_INVERTED]: 'adobe-red-inverted',
  [BUTTON_THEME_ADOBE_RED_OUTLINE]: 'adobe-red-outline',
  [BUTTON_THEME_ADOBE_WHITE]: 'adobe-white',
  [BUTTON_THEME_ADOBE_WHITE_BLUE_BORDER]: 'adobe-white-blue-border',
  [BUTTON_THEME_ADOBE_BLUE_BORDER]: 'adobe-blue-border',
  [BUTTON_THEME_BLUR]: 'blur',
  [BUTTON_THEME_ASSEMBLY_LINE_BLUE]: 'assembly-line-blue',
  [BUTTON_THEME_ADOBE_TRANSPARENT_BLUE_BORDER]: 'adobe-transparent-blue-border',
  [BUTTON_THEME_ADOBE_TRANSPARENT_RED_BORDER]: 'adobe-transparent-red-border',
  [BUTTON_THEME_TRANSPARENT]: 'transparent',
};
const BUTTON_THEMES = Object.keys(BUTTON_THEME_TO_CLASSNAME_MAPPING);

export const BUTTON_HEIGHT_SHORTER = 'BUTTON_HEIGHT_SHORTER';
export const BUTTON_HEIGHT_SHORT = 'BUTTON_HEIGHT_SHORT';
export const BUTTON_HEIGHT_MEDIUM = 'BUTTON_HEIGHT_MEDIUM';
export const BUTTON_HEIGHT_TALL = 'BUTTON_HEIGHT_TALL';
export const BUTTON_HEIGHT_EXTRA_TALL = 'BUTTON_HEIGHT_EXTRA_TALL';
const BUTTON_HEIGHT_TO_CLASSNAME_MAPPING = {
  BUTTON_HEIGHT_SHORTER: 'height-shorter',
  BUTTON_HEIGHT_SHORT: 'height-short',
  BUTTON_HEIGHT_MEDIUM: 'height-medium',
  BUTTON_HEIGHT_TALL: 'height-tall',
  BUTTON_HEIGHT_EXTRA_TALL: 'height-extra-tall',
};

export const BUTTON_FONT_SIZE_SMALL = 'BUTTON_FONT_SIZE_SMALL';
export const BUTTON_FONT_SIZE_MEDIUM = 'BUTTON_FONT_SIZE_MEDIUM';
const BUTTON_FONT_SIZE_TO_CLASSNAME_MAPPING = {
  BUTTON_FONT_SIZE_SMALL: 'font-size-small',
  BUTTON_FONT_SIZE_MEDIUM: 'font-size-medium',
};

const Button = ({
  children,
  disabled,
  onClick,
  type,
  minWidth,
  width,
  heightType,
  hasBoxShadow,
  theme,
  flexGrow,
  iconUrl,
  iconHeight,
  fontSizeType,
  wrapText,
  padding,
  margin,
}) => {
  if (width && minWidth === '100%') {
    minWidth = null;
  }
  const buttonStyles = {
    minWidth: minWidth || null,
    width: width || null,
    flexGrow: flexGrow || null,
    margin: margin || null,
  };
  if (padding) {
    buttonStyles.padding = padding;
  }
  return (
    <button
      styleName={classnames(
        'Button',
        BUTTON_THEME_TO_CLASSNAME_MAPPING[theme],
        BUTTON_HEIGHT_TO_CLASSNAME_MAPPING[heightType],
        BUTTON_FONT_SIZE_TO_CLASSNAME_MAPPING[fontSizeType],
        { hasBoxShadow, disabled, wrapText },
      )}
      onClick={onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      style={buttonStyles}
    >
      {iconUrl ? (
        <Flex justify='center' align='center'>
          <Box marginRight='9px'>
            <img alt='button-icon' src={iconUrl} width='auto' height={iconHeight} />
          </Box>
          {children}
        </Flex>
      ) : children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  minWidth: PropTypes.string,
  heightType: PropTypes.oneOf(Object.keys(BUTTON_HEIGHT_TO_CLASSNAME_MAPPING)),
  hasBoxShadow: PropTypes.bool,
  theme: PropTypes.oneOf(BUTTON_THEMES),
  flexGrow: PropTypes.string,
  iconHeight: PropTypes.string,
  iconUrl: PropTypes.string,
  fontSizeType: PropTypes.oneOf(Object.keys(BUTTON_FONT_SIZE_TO_CLASSNAME_MAPPING)),
};

Button.defaultProps = {
  type: 'button',
  minWidth: '100%',
  iconHeight: '18px',
  heightType: BUTTON_HEIGHT_MEDIUM,
  fontSizeType: BUTTON_FONT_SIZE_MEDIUM,
};

export default Button;
