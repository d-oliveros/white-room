import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { ANALYTICS_EVENT_LOGO_CLICK } from '#client/analytics/eventList';
import analytics from '#client/analytics/analytics.js';
import Link from '#client/components/Link/Link.jsx';

export const LOGO_ALIGN_CENTER = 'center';
export const LOGO_ALIGN_LEFT = 'left';

const LOGO_ALIGN_TO_CLASSNAME_MAPPING = {
  [LOGO_ALIGN_CENTER]: 'align-center',
  [LOGO_ALIGN_LEFT]: 'align-left',
};

export const LOGO_THEME_DEFAULT = 'default';
export const LOGO_THEME_REDESIGN = 'redesign';

const LOGO_THEME_TO_CLASSNAME_MAPPING = {
  [LOGO_THEME_DEFAULT]: 'theme-default',
  [LOGO_THEME_REDESIGN]: 'theme-redesign',
};

const Logo = ({ align, theme, redirectTo, disableRedirect }) => {
  const srLogoClassnames = classnames(
    'Logo logo',
    LOGO_ALIGN_TO_CLASSNAME_MAPPING[align],
    LOGO_THEME_TO_CLASSNAME_MAPPING[theme],
  );
  if (disableRedirect) {
    return (
      <div
        className={classnames(
          srLogoClassnames,
          'disabled',
        )}
      />
    );
  }
  return (
    <Link
      to={redirectTo}
      className={srLogoClassnames}
      onClick={() => analytics.track(ANALYTICS_EVENT_LOGO_CLICK)}
    />
  );
};

Logo.propTypes = {
  redirectTo: PropTypes.string,
  align: PropTypes.string,
  theme: PropTypes.string,
};

Logo.defaultProps = {
  redirectTo: '/',
  align: 'center',
  theme: 'default',
};

export default Logo;
