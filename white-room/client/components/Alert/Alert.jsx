import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export const ALERT_THEME_WARNING = 'ALERT_THEME_WARNING';

const ALERT_THEME_TO_CLASSNAME_MAPPING = {
  [ALERT_THEME_WARNING]: 'warning',
};

const ALERT_THEMES = Object.keys(ALERT_THEME_TO_CLASSNAME_MAPPING);

class Alert extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    theme: PropTypes.oneOf(ALERT_THEMES),
    iconSrc: PropTypes.string,
  }

  render() {
    const {
      children,
      theme,
      iconSrc,
    } = this.props;

    return (
      <div className={classnames('Alert', ALERT_THEME_TO_CLASSNAME_MAPPING[theme])}>
        {iconSrc && (
          <img
            className='icon'
            alt='icon'
            src={iconSrc}
          />
        )}
        {children}
      </div>
    );
  }
}

export default Alert;
