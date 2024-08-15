import React, { useEffect, useState, useMemo } from 'react';
import classnames from 'classnames';
import { Outlet } from 'react-router-dom';

import isUserAgentMobileApp, { isUserAgentIphoneApp } from '#whiteroom/util/isUserAgentMobileApp.js';

import useBranch from '#whiteroom/client/hooks/useBranch.js';
import useApiClient from '#whiteroom/client/hooks/useApiClient.js';

// Interval for checking the app commit hash vs the server commit hash to reload the page when a new version is available.
const CHECK_APP_VERSION_INTERVAL_MS = 1800000; // 30 minutes.

const App = () => {
  console.log('Rendering App.jsx');

  const apiClient = useApiClient();
  const [, setCheckAppVersionInterval] = useState(null);
  const [checkAppVersionLastRunTimestamp, setCheckAppVersionLastRunTimestamp] = useState(Date.now());

  const { userAgent } = useBranch({
    userAgent: ['userAgent'],
  });

  const isMobileApp = useMemo(() => isUserAgentMobileApp(userAgent), [userAgent]);

  useEffect(() => {
    const interval = global.setInterval(() => {
      if (global.document && global.document.hidden) {
        return;
      }
      const now = Date.now();
      if (now - checkAppVersionLastRunTimestamp > CHECK_APP_VERSION_INTERVAL_MS) {
        setCheckAppVersionLastRunTimestamp(now);
        apiClient.post('/admin/getAppCommitHash');
      }
    }, 1000);
    setCheckAppVersionInterval(interval);

    return () => {
      global.clearInterval(interval);
      setCheckAppVersionInterval(null);
    };
  }, [checkAppVersionLastRunTimestamp, apiClient]);

  return (
    <div
      className={classnames(
        'app-container',
        {
          webview: isMobileApp,
          ios: isUserAgentIphoneApp(userAgent),
        },
      )}
    >
      <Outlet />
    </div>
  );
};

export default App;
