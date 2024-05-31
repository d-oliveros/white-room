import React from 'react';
import PropTypes from 'prop-types';

import './NavigationButton.less';

import Link from '#client/components/Link/Link.jsx';

const NavigationButton = ({
  color,
  iconUrl,
  iconSize,
  to,
  onClick,
  title,
  subtitle,
  className,
}) => {
  return to ? (
    <Link styleName='link' to={to}>
      <div className={className} styleName='component'>
        <div
          styleName='navIcon'
          style={{
            backgroundImage: `url(${iconUrl})`,
            backgroundColor: color,
            backgroundSize: `${iconSize}px`,
          }}
        />
        <div styleName='textContainer'>
          <div styleName='title'>{title}</div>
          <div styleName='subtitle'>{subtitle}</div>
        </div>
        <img styleName='rightArrow' alt='right arrow' src='/images/right-arrow-small-light-blue.svg' />
      </div>
    </Link>
  ) : (
    <div onClick={onClick}>
      <div className={className} styleName='component'>
        <div
          styleName='navIcon'
          style={{
            backgroundImage: `url(${iconUrl})`,
            backgroundColor: color,
            backgroundSize: `${iconSize}px`,
          }}
        />
        <div styleName='textContainer'>
          <div styleName='title'>{title}</div>
          <div styleName='subtitle'>{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

NavigationButton.propTypes = {
  color: PropTypes.string,
  iconUrl: PropTypes.string,
  iconSize: PropTypes.number,
  to: PropTypes.string,
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  className: PropTypes.string,
};

NavigationButton.defaultProps = {
  iconUrl: '/images/house-icon-white.svg',
  iconSize: 17,
  color: '#00A238',
};

export default NavigationButton;
