import React from 'react';
import PropTypes from 'prop-types';

import useBranch from '#client/hooks/useBranch.js';
import isUserAgentMobileApp from '#common/util/isUserAgentMobileApp.js';
import sendDataToMobileApp, { MOBILE_APP_ACTION_TYPE_OPEN_URL } from '#client/helpers/sendDataToMobileApp';

const ExternalLink = ({ link, className, onClick, children, style }) => {
  const { userAgent } = useBranch({
    userAgent: ['analytics', 'userAgent'],
  });

  const onClickLink = (event) => {
    const isMobileApp = isUserAgentMobileApp(userAgent);

    event.preventDefault();

    if (isMobileApp) {
      sendDataToMobileApp({
        actionType: MOBILE_APP_ACTION_TYPE_OPEN_URL,
        url: link,
      });
    } else {
      global.open(link, '_blank');
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <span
      onClick={onClickLink}
      className={className}
      style={style}
    >
      {children}
    </span>
  );
};

ExternalLink.propTypes = {
  link: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.object,
};

export default ExternalLink;
