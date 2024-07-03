import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import classnames from 'classnames';
import { useLocation, Routes, Route } from 'react-router-dom';

import parseQueryString from '#common/util/parseQueryString.js';
import isUserAgentMobileApp, { isUserAgentIphoneApp } from '#common/util/isUserAgentMobileApp.js';

import { hasRoleAnonymous } from '#common/userRoles.js';

import {
  API_ACTION_GET_APP_COMMIT_HASH,
} from '#api/actionTypes.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED,
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#client/helpers/sendDataToMobileApp.js';

import useBranch from '#client/hooks/useBranch.js';
import useApiClient from '#client/hooks/useApiClient.js';
import useBrowsingHistoryTracker from '#client/hooks/useBrowsingHistoryTracker.js';

import MobileAppEventListener from '#client/components/MobileAppEventListener/MobileAppEventListener.jsx';
import EnablePushNotificationsModal from '#client/components/EnablePushNotificationsModal/EnablePushNotificationsModal.jsx';
import Link from '#client/components/Link/Link.jsx';

// Interval for checking the app commit hash vs the server commit hash to reload the page when a new version is available.
const CHECK_APP_VERSION_INTERVAL_MS = 1800000; // 30 minutes.

const App = () => {
  console.log('Rendering App.jsx');

  const apiClient = useApiClient();
  const location = useLocation();
  const [, setCheckAppVersionInterval] = useState(null);
  const [checkAppVersionLastRunTimestamp, setCheckAppVersionLastRunTimestamp] = useState(Date.now());

  useBrowsingHistoryTracker();

  const { userAgent, currentUser, askPushNotifications } = useBranch({
    userAgent: ['userAgent'],
    currentUser: ['currentUser'],
    askPushNotifications: ['askPushNotifications'],
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
        apiClient.post(API_ACTION_GET_APP_COMMIT_HASH);
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
  }, [checkAppVersionLastRunTimestamp, apiClient, currentUser, userAgent, location]);

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
      <MobileAppEventListener />
      <Outlet />
      {askPushNotifications && (
        <EnablePushNotificationsModal
          onClose={() => {}}
        />
      )}
    </div>
  );
};

export default App;
