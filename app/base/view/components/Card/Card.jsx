import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Box from '#base/view/components/Box/Box.jsx';

import './Card.less';

export const CARD_FONT_SIZE_SMALL = 'CARD_FONT_SIZE_SMALL';
export const CARD_FONT_SIZE_REGULAR = 'CARD_FONT_SIZE_REGULAR';
const CARD_FONT_SIZE_CLASSNAME_MAPPING = {
  CARD_FONT_SIZE_SMALL: 'font-size-small',
  CARD_FONT_SIZE_REGULAR: 'font-size-regular',
};

export const CARD_CONTENT_TYPE_FORM_REGULAR = 'CARD_CONTENT_TYPE_FORM_REGULAR';
export const CARD_CONTENT_TYPE_FORM_GRID = 'CARD_CONTENT_TYPE_FORM_GRID';
const CARD_CONTENT_TYPE_CLASSNAME_MAPPING = {
  CARD_CONTENT_TYPE_FORM_REGULAR: 'content-type-form-regular',
  CARD_CONTENT_TYPE_FORM_GRID: 'content-type-form-grid',
};

export const CARD_BULLET_COLOR_GREEN = 'CARD_BULLET_COLOR_GREEN';
export const CARD_BULLET_COLOR_PURPLE = 'CARD_BULLET_COLOR_PURPLE';
export const CARD_BULLET_COLOR_YELLOW = 'CARD_BULLET_COLOR_YELLOW';
export const CARD_BULLET_COLOR_BLUE = 'CARD_BULLET_COLOR_BLUE';
export const CARD_BULLET_COLOR_BLACK = 'CARD_BULLET_COLOR_BLACK';
const CARD_BULLET_COLOR_CLASSNAME_MAPPING = {
  [CARD_BULLET_COLOR_GREEN]: 'bulletColorGreen',
  [CARD_BULLET_COLOR_PURPLE]: 'bulletColorPurple',
  [CARD_BULLET_COLOR_YELLOW]: 'bulletColorYellow',
  [CARD_BULLET_COLOR_BLUE]: 'bulletColorBlue',
  [CARD_BULLET_COLOR_BLACK]: 'bulletColorBlack',
};
const CARD_BULLET_COLORS = Object.keys(CARD_BULLET_COLOR_CLASSNAME_MAPPING);

const Card = forwardRef(({
  color = CARD_BULLET_COLOR_GREEN,
  padding,
  noContentPadding = false,
  header,
  contentType,
  headerSizeType = CARD_FONT_SIZE_REGULAR,
  subheader,
  iconUrl,
  maxWidth = '900px',
  className,
  overflow,
  children,
  height,
  margin,
  borderRadius,
  isHighlighted,
}, ref) => {
  return (
    <Box
      ref={ref}
      className={classnames(className, { highlightAnimation: isHighlighted })}
      styleName={classnames('Card', { noContentPadding })}
      padding={padding}
      maxWidth={maxWidth}
      overflow={overflow}
      height={height}
      margin={margin}
      borderRadius={borderRadius}
    >
      {header && (
        <div styleName={classnames('headerContainer', noContentPadding ? 'headerPadding' : null)}>
          <span
            style={{
              backgroundImage: iconUrl ? `url(${iconUrl})` : 'none',
            }}
            styleName={classnames('iconUrl', CARD_BULLET_COLOR_CLASSNAME_MAPPING[color])}
          />
          <span>
            <span styleName='headerTextContainer'>
              <span
                styleName={classnames('header', CARD_FONT_SIZE_CLASSNAME_MAPPING[headerSizeType])}
              >
                {header}
              </span>
              {subheader && (
                <span styleName='subheader'>{subheader}</span>
              )}
            </span>
          </span>
        </div>
      )}
      {children &&
        <div styleName={classnames(
          'contentContainer',
          !subheader ? 'noSubheader' : null,
          CARD_CONTENT_TYPE_CLASSNAME_MAPPING[contentType],
        )}
        >
          {children}
        </div>
      }
    </Box>
  );
});

Card.propTypes = {
  color: PropTypes.oneOf(CARD_BULLET_COLORS),
  contentType: PropTypes.oneOf(Object.keys(CARD_CONTENT_TYPE_CLASSNAME_MAPPING)),
  padding: PropTypes.string,
  noContentPadding: PropTypes.bool,
  header: PropTypes.string,
  headerSizeType: PropTypes.oneOf(Object.keys(CARD_FONT_SIZE_CLASSNAME_MAPPING)),
  subheader: PropTypes.string,
  iconUrl: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
  overflow: PropTypes.string,
  margin: PropTypes.string,
  borderRadius: PropTypes.string,
  isHighlighted: PropTypes.bool,
};

export default Card;
