import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './InitialsCircle.less';

export const INITIALS_CIRCLE_THEME_YELLOW = 'INITIALS_CIRCLE_THEME_YELLOW';
export const INITIALS_CIRCLE_THEME_PURPLE = 'INITIALS_CIRCLE_THEME_PURPLE';
const INITIALS_CIRCLE_THEME_TO_CLASSNAME_MAPPING = {
  [INITIALS_CIRCLE_THEME_YELLOW]: 'initials-circle-yellow',
  [INITIALS_CIRCLE_THEME_PURPLE]: 'initials-circle-purple',
};
const INITIALS_CIRCLE_THEMES = Object.keys(INITIALS_CIRCLE_THEME_TO_CLASSNAME_MAPPING);

const InitialsCircle = ({
  initial,
  theme,
  hasBorder,
}) => (
  <div styleName={classnames(
    'InitialsCircle',
    INITIALS_CIRCLE_THEME_TO_CLASSNAME_MAPPING[theme],
    { hasBorder },
  )}
  >
    <span>{initial}</span>
  </div>
);

InitialsCircle.propTypes = {
  initial: PropTypes.string.isRequired,
  theme: PropTypes.oneOf(INITIALS_CIRCLE_THEMES),
  hasBorder: PropTypes.bool,
};

InitialsCircle.defaultProps = {
  theme: INITIALS_CIRCLE_THEME_PURPLE,
};

export default InitialsCircle;
