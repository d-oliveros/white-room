import React, { useEffect, useState, useMemo } from 'react';
import classnames from 'classnames';
import { Outlet, useLocation } from 'react-router-dom';

import parseQueryString from '#white-room/util/parseQueryString.js';
import isUserAgentMobileApp, { isUserAgentIphoneApp } from '#white-room/util/isUserAgentMobileApp.js';

import { hasRoleAnonymous } from '#user/constants/roles.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED,
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#white-room/client/helpers/sendDataToMobileApp.js';

import useBranch from '#white-room/client/hooks/useBranch.js';
import useApiClient from '#white-room/client/hooks/useApiClient.js';
import useBrowsingHistoryTracker from '#white-room/client/hooks/useBrowsingHistoryTracker.js';

// import EnablePushNotificationsModal from '#ui/view/components/EnablePushNotificationsModal/EnablePushNotificationsModal.jsx';

// Interval for checking the app commit hash vs the server commit hash to reload the page when a new version is available.
const CHECK_APP_VERSION_INTERVAL_MS = 1800000; // 30 minutes.

const App = () => {
  console.log('Rendering App.jsx');

  const apiClient = useApiClient();
  const location = useLocation();
  const [, setCheckAppVersionInterval] = useState(null);
  const [checkAppVersionLastRunTimestamp, setCheckAppVersionLastRunTimestamp] = useState(Date.now());

  useBrowsingHistoryTracker();

  const { userAgent, currentUser } = useBranch({
    userAgent: ['userAgent'],
    currentUser: ['currentUser'],
  });

  const isMobileApp = useMemo(() => isUserAgentMobileApp(userAgent), [userAgent]);

  useEffect(() => {
    const handleWheel = () => {
      if (global.document.activeElement.type === 'number') {
        global.document.activeElement.blur();
      }
    };
    global.document.addEventListener('wheel', handleWheel);

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

    if (isMobileApp) {
      if (!hasRoleAnonymous(currentUser.roles)) {
        sendDataToMobileApp({
          actionType: MOBILE_APP_ACTION_TYPE_CURRENT_USER,
          currentUser: currentUser,
        });
      }

      sendDataToMobileApp({
        actionType: MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED,
        routePath: location.pathname,
        routeQuery: parseQueryString(location.search || ''),
        currentUser: currentUser,
      });

      return () => {
        global.document.removeEventListener('wheel', handleWheel);
        global.clearInterval(interval);
        setCheckAppVersionInterval(null);
      };
    }

    return () => {
      global.document.removeEventListener('wheel', handleWheel);
      global.clearInterval(interval);
      setCheckAppVersionInterval(null);
    };
  }, [checkAppVersionLastRunTimestamp, apiClient, currentUser, userAgent, location, isMobileApp]);

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
