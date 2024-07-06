import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import classnames from 'classnames';

import emptyFunction from '#white-room/util/emptyFunction.js';
import isUserAgentMobileApp from '#white-room/util/isUserAgentMobileApp.js';
import useBranch from '#white-room/client/hooks/useBranch.js';

const DarkModal = ({ children, onClose, className }) => {
  const { userAgent } = useBranch({
    userAgent: ['analytics', 'userAgent'],
  });

  useEffect(() => {
    global.document.body.classList.add('overflow-hidden');
    return () => {
      global.document.body.classList.remove('overflow-hidden');
    };
  }, []);

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
};

DarkModal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  userAgent: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default DarkModal;
