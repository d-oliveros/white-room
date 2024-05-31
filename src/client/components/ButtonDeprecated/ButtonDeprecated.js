import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Link from '#client/components/Link/Link.js';

export const BUTTON_THEME_YELLOW = 'BUTTOM_THEME_YELLOW';
export const BUTTON_THEME_DARK_GRAY = 'BUTTON_THEME_DARK_GRAY';
export const BUTTON_THEME_BLUE = 'BUTTOM_THEME_BLUE';
export const BUTTON_THEME_WHITE = 'BUTTOM_THEME_WHITE';
export const BUTTON_THEME_RED = 'BUTTON_THEME_RED';
export const BUTTON_THEME_RED_INVERT = 'BUTTON_THEME_RED_INVERT';
export const BUTTON_THEME_GREEN = 'BUTTON_THEME_GREEN';
export const BUTTON_THEME_GREEN_INVERT = 'BUTTON_THEME_GREEN_INVERT';
export const BUTTON_THEME_YELLOW_GREYCLIFF = 'BUTTON_THEME_YELLOW_GREYCLIFF';
export const BUTTON_THEME_BLUE_GREYCLIFF = 'BUTTON_THEME_BLUE_GREYCLIFF';
export const BUTTON_THEME_GRAY_GREYCLIFF = 'BUTTON_THEME_GRAY_GREYCLIFF';
export const BUTTON_THEME_BLACK_GREYCLIFF = 'BUTTON_THEME_BLACK_GREYCLIFF';
export const BUTTON_THEME_GREEN_INVERT_GREYCLIFF = 'BUTTON_THEME_GREEN_INVERT_GREYCLIFF';
export const BUTTON_THEME_GREEN_ADOBE = 'BUTTON_THEME_GREEN_ADOBE';
export const BUTTON_THEME_GREEN_ADOBE_FLEX = 'BUTTON_THEME_GREEN_ADOBE_FLEX';
export const BUTTON_THEME_GREY_ADOBE = 'BUTTON_THEME_GREY_ADOBE';
export const BUTTON_THEME_GREY_ADOBE_FLEX = 'BUTTON_THEME_GREY_ADOBE_FLEX';
export const BUTTON_THEME_RED_ADOBE = 'BUTTON_THEME_RED_ADOBE';
export const BUTTON_THEME_WHITE_ADOBE = 'BUTTON_THEME_WHITE_ADOBE';
export const BUTTON_THEME_WHITE_ADOBE_SMALL = 'BUTTON_THEME_WHITE_ADOBE_SMALL';
export const BUTTON_THEME_BLUR = 'BUTTON_THEME_BLUR';
const BUTTON_THEME_TO_CLASSNAME_MAPPING = {
  [BUTTON_THEME_YELLOW]: 'yellow',
  [BUTTON_THEME_DARK_GRAY]: 'darkGray',
  [BUTTON_THEME_BLUE]: 'blue',
  [BUTTON_THEME_WHITE]: 'white',
  [BUTTON_THEME_RED]: 'red',
  [BUTTON_THEME_RED_INVERT]: 'red-invert',
  [BUTTON_THEME_GREEN]: 'green',
  [BUTTON_THEME_GREEN_INVERT]: 'green-invert',
  [BUTTON_THEME_YELLOW_GREYCLIFF]: 'yellow-greycliff',
  [BUTTON_THEME_BLUE_GREYCLIFF]: 'blue-greycliff',
  [BUTTON_THEME_GRAY_GREYCLIFF]: 'gray-greycliff',
  [BUTTON_THEME_BLACK_GREYCLIFF]: 'black-greycliff',
  [BUTTON_THEME_GREEN_INVERT_GREYCLIFF]: 'green-invert-greycliff',
  [BUTTON_THEME_GREEN_ADOBE]: 'green-adobe',
  [BUTTON_THEME_GREY_ADOBE]: 'grey-adobe',
  [BUTTON_THEME_RED_ADOBE]: 'red-adobe',
  [BUTTON_THEME_WHITE_ADOBE]: 'white-adobe',
  [BUTTON_THEME_WHITE_ADOBE_SMALL]: 'white-adobe-small',
  [BUTTON_THEME_GREEN_ADOBE_FLEX]: 'green-adobe-flex',
  [BUTTON_THEME_GREY_ADOBE_FLEX]: 'grey-adobe-flex',
  [BUTTON_THEME_BLUR]: 'blur',
};
const BUTTON_THEMES = Object.keys(BUTTON_THEME_TO_CLASSNAME_MAPPING);

const ButtonDeprecated = ({
  children,
  disabled,
  onClick,
  theme,
  className,
  type,
  href,
  download,
  width,
  minWidth,
  height,
  minHeight,
  margin,
}) => {
  const ContainerComponent = (href
    ? Link
    : 'button'
  );

  return (
    <ContainerComponent
      className={classNames(
        'button',
        BUTTON_THEME_TO_CLASSNAME_MAPPING[theme],
        className,
        { disabled },
      )}
      onClick={onClick}
      type={type}
      to={href}
      download={download}
      style={{
        width: width || null,
        minWidth: minWidth || null,
        height: height || null,
        minHeight: minHeight || null,
        margin: margin || null,
      }}
    >
      {children}
    </ContainerComponent>
  );
};

ButtonDeprecated.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  href: PropTypes.string,
  download: PropTypes.bool,
  type: PropTypes.string,
  theme: PropTypes.oneOf(BUTTON_THEMES),
  width: PropTypes.string,
  minWidth: PropTypes.string,
  height: PropTypes.string,
  minHeight: PropTypes.string,
  margin: PropTypes.string,
};

ButtonDeprecated.defaultProps = {
  theme: BUTTON_THEME_YELLOW,
  type: 'button',
};

export default ButtonDeprecated;
