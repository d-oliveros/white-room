import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './Tag.less';

export const TAG_THEME_GREEN_WHITE = 'TAG_THEME_GREEN_WHITE';
export const TAG_THEME_WHITE_BLACK = 'TAG_THEME_WHITE_BLACK';
export const TAG_THEME_WHITE_GREEN = 'TAG_THEME_WHITE_GREEN';
export const TAG_THEME_GOLD_WHITE = 'TAG_THEME_GOLD_WHITE';
export const TAG_THEME_BLUE_WHITE = 'TAG_THEME_BLUE_WHITE';
export const TAG_THEME_BLUE_WHITE_SMALL = 'TAG_THEME_BLUE_WHITE_SMALL';
export const TAG_THEME_PURPLE_WHITE = 'TAG_THEME_PURPLE_WHITE';
export const TAG_THEME_GREEN_ADOBE = 'TAG_THEME_GREEN_ADOBE';
export const TAG_THEME_ORANGE_WHITE = 'TAG_THEME_ORANGE_WHITE';
export const TAG_THEME_RED_WHITE = 'TAG_THEME_RED_WHITE';
export const TAG_THEME_LIGHTGREEN_GREEN = 'TAG_THEME_LIGHTGREEN_GREEN';
export const TAG_THEME_LIGHTBLUE_BLACK = 'TAG_THEME_LIGHTBLUE_BLACK';
export const TAG_THEME_LIGHTBLUE_BLACK_HOVER = 'TAG_THEME_LIGHTBLUE_BLACK_HOVER';
export const TAG_THEME_GREY_OUTLINE = 'TAG_THEME_GREY_OUTLINE';
export const TAG_THEME_ORANGE_OUTLINE = 'TAG_THEME_ORANGE_OUTLINE';

export const TAG_THEME_TO_CLASSNAME_MAPPING = {
  [TAG_THEME_GREEN_WHITE]: 'tagThemeGreenWhite',
  [TAG_THEME_GOLD_WHITE]: 'tagThemeGoldWhite',
  [TAG_THEME_BLUE_WHITE]: 'tagThemeBlueWhite',
  [TAG_THEME_BLUE_WHITE_SMALL]: 'tagThemeBlueWhiteSmall',
  [TAG_THEME_PURPLE_WHITE]: 'tagThemePurpleWhite',
  [TAG_THEME_ORANGE_WHITE]: 'tagThemeOrangeWhite',
  [TAG_THEME_GREEN_ADOBE]: 'tagThemeGreenAdobe',
  [TAG_THEME_WHITE_BLACK]: 'tagThemeWhiteBlack',
  [TAG_THEME_WHITE_GREEN]: 'tagThemeWhiteGreen',
  [TAG_THEME_RED_WHITE]: 'tagThemeRedWhite',
  [TAG_THEME_LIGHTGREEN_GREEN]: 'tagThemeLightgreenGreen',
  [TAG_THEME_LIGHTBLUE_BLACK]: 'tagThemeLightblueBlack',
  [TAG_THEME_LIGHTBLUE_BLACK_HOVER]: 'tagThemeLightblueBlackHover',
  [TAG_THEME_GREY_OUTLINE]: 'tagThemeGreyOutline',
  [TAG_THEME_ORANGE_OUTLINE]: 'tagThemeOrangeOutline',
};
export const TAG_THEMES = Object.keys(TAG_THEME_TO_CLASSNAME_MAPPING);

const Tag = ({ theme, className, children, onClick, variation }) => {
  return (
    <div
      styleName={classnames(
        'Tag',
        TAG_THEME_TO_CLASSNAME_MAPPING[theme],
        variation,
      )}
      className={className}
      onClick={onClick}
    >
      <span>
        {children}
      </span>
    </div>
  );
};

Tag.propTypes = {
  theme: PropTypes.oneOf(TAG_THEMES),
  children: PropTypes.node,
  onClick: PropTypes.func,
  variation: PropTypes.string,
};

Tag.defaultProps = {
  theme: TAG_THEME_GREEN_WHITE,
};

export default Tag;
