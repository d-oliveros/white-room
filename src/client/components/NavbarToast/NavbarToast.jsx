import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export const NAVBAR_TOAST_THEME_GREEN = 'NAVBAR_TOAST_THEME_GREEN';
export const NAVBAR_TOAST_THEME_YELLOW = 'NAVBAR_TOAST_THEME_YELLOW';

const NAVBAR_TOAST_THEME_TO_CLASSNAME_MAPPING = {
  [NAVBAR_TOAST_THEME_GREEN]: 'green',
  [NAVBAR_TOAST_THEME_YELLOW]: 'yellow',
};

const NAVBAR_TOAST_THEMES = Object.keys(NAVBAR_TOAST_THEME_TO_CLASSNAME_MAPPING);

const NavbarToast = ({
  toastContent,
  theme,
  disappear,
}) => (
  <div
    className={classnames('navbar-toast', NAVBAR_TOAST_THEME_TO_CLASSNAME_MAPPING[theme], {
      disappear,
    })}
  >
    <span>
      {toastContent}
    </span>
  </div>
);

NavbarToast.propTypes = {
  theme: PropTypes.oneOf(NAVBAR_TOAST_THEMES),
  disappear: PropTypes.bool,
};

NavbarToast.defaultProps = {
  theme: NAVBAR_TOAST_THEME_GREEN,
  disappear: true,
};

export default NavbarToast;
