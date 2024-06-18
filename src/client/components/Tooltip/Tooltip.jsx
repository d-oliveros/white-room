import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export const TOOLTIP_ICON_QUESTION_MARK = 'icon-questionMark';
export const TOOLTIP_ICON_PEOPLE = 'icon-people';

const TOOLTIP_ICONS = [
  TOOLTIP_ICON_QUESTION_MARK,
  TOOLTIP_ICON_PEOPLE,
];

export const TOOLTIP_POSITION_LEFT = 'position-left';
export const TOOLTIP_POSITION_CENTER = 'position-center';
export const TOOLTIP_POSITION_CENTER_UNDERNEATH = 'position-center-underneath';

export const TOOLTIP_POSITIONS = [
  TOOLTIP_POSITION_LEFT,
  TOOLTIP_POSITION_CENTER,
  TOOLTIP_POSITION_CENTER_UNDERNEATH,
];

export const TOOLTIP_BG_COLOR_TO_CLASSNAME_MAPPING = {
  blue: 'bg-color-blue',
  blueBright: 'bg-color-blue-bright',
  orange600: 'bg-color-orange600',
  green: 'bg-color-green',
  'green-dark': 'bg-color-green-dark',
  red: 'bg-color-red',
};

const Tooltip = ({
  label,
  iconName = TOOLTIP_ICON_QUESTION_MARK,
  icon,
  children,
  position = TOOLTIP_POSITION_CENTER,
  bgColor,
  className,
  tooltipContentStyle,
}) => (
  <span
    className={classnames(
      'Tooltip',
      TOOLTIP_BG_COLOR_TO_CLASSNAME_MAPPING[bgColor],
      iconName,
      position,
      className,
    )}
  >
    {label && (
      <span className='tooltipLabel'>{label}</span>
    )}
    {icon || <span className='tooltipIcon' />}
    <span className='tooltipContent' style={tooltipContentStyle}>
      {children}
    </span>
  </span>
);

Tooltip.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  label: PropTypes.node,
  icon: PropTypes.node,
  iconName: PropTypes.oneOf(TOOLTIP_ICONS),
  position: PropTypes.oneOf(TOOLTIP_POSITIONS),
  bgColor: PropTypes.oneOf(Object.keys(TOOLTIP_BG_COLOR_TO_CLASSNAME_MAPPING)),
  tooltipContentStyle: PropTypes.object,
};

export default Tooltip;
