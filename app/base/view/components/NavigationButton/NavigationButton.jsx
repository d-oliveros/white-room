import React from 'react';
import PropTypes from 'prop-types';

import './NavigationButton.less';

import Link from '#base/view/components/Link/Link.jsx';

const NavigationButton = ({
  color = '#00A238',
  iconUrl = '/images/house-icon-white.svg',
  iconSize = 17,
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

export default NavigationButton;
