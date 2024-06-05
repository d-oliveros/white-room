import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import classnames from 'classnames';

import emptyFunction from '#common/util/emptyFunction.js';
import isUserAgentMobileApp from '#common/util/isUserAgentMobileApp.js';
import branch from '#client/core/branch.jsx';

@branch({
  userAgent: ['analytics', 'userAgent'],
})
class DarkModal extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func,
    userAgent: PropTypes.object.isRequired,
    className: PropTypes.string,
  }

  componentDidMount() {
    global.document.body.classList.add('overflow-hidden');
  }

  componentWillUnmount() {
    global.document.body.classList.remove('overflow-hidden');
  }

  render() {
    const {
      children,
      onClose,
      userAgent,
      className,
    } = this.props;

    const isMobileApp = isUserAgentMobileApp(userAgent);

    return (
      <Portal>
        <div
          onClick={onClose || emptyFunction}
          className={classnames(
            'darkModal',
            { webview: isMobileApp },
            className,
          )}
        >
          {children}
        </div>
      </Portal>
    );
  }
}

export default DarkModal;
