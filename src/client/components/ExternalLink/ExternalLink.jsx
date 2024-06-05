import React, { Component } from 'react';
import PropTypes from 'prop-types';

import branch from '#client/core/branch.jsx';
import isUserAgentMobileApp from '#common/util/isUserAgentMobileApp.js';
import sendDataToMobileApp, { MOBILE_APP_ACTION_TYPE_OPEN_URL } from '#client/helpers/sendDataToMobileApp';

@branch({
  userAgent: ['analytics', 'userAgent'],
})
class ExternalLink extends Component {
  static propTypes = {
    link: PropTypes.string.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node,
  }

  onClickLink = (event) => {
    const { link, onClick, userAgent } = this.props;
    const isMobileApp = isUserAgentMobileApp(userAgent);

    event.preventDefault();

    if (isMobileApp) {
      sendDataToMobileApp({
        actionType: MOBILE_APP_ACTION_TYPE_OPEN_URL,
        url: link,
      });
    }
    else {
      global.open(link, '_blank');
    }

    if (onClick) {
      onClick();
    }
  }

  render() {
    const { className, children, style } = this.props;

    return (
      <span
        onClick={this.onClickLink}
        className={className}
        style={style}
      >
        {children}
      </span>
    );
  }
}

export default ExternalLink;
