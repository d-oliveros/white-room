import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useLocation, Routes, Route } from 'react-router-dom';

import parseQueryString from '#common/util/parseQueryString.js';
import isUserAgentMobileApp, { isUserAgentIphoneApp } from '#common/util/isUserAgentMobileApp.js';

import { hasRoleAnonymous } from '#common/userRoles.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED,
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#client/helpers/sendDataToMobileApp.js';

import { API_ACTION_GET_APP_COMMIT_HASH } from '#api/actionTypes.js';

import useBranch from '#client/hooks/useBranch.js';
import MobileAppEventListener from '#client/components/MobileAppEventListener/MobileAppEventListener.jsx';
import EnablePushNotificationsModal from '#client/components/EnablePushNotificationsModal/EnablePushNotificationsModal.jsx';

const AppRouter = ({ routes }) => (
  <Routes>
    {routes.map((route, index) => (
      <Route
        key={index}
        path={route.path || '*'}
        element={<route.component />}
        exact={route.exact}
      />
    ))}
  </Routes>
);

AppRouter.propTypes = {
  routes: PropTypes.array.isRequired,
};

// Interval for checking the app commit hash vs the server commit hash to reload the page when a new version is available.
const CHECK_APP_VERSION_INTERVAL_MS = 1800000; // 30 minutes.

const App = ({ routes, apiClient }) => {
  const [, setCheckAppVersionInterval] = useState(null);
  const [checkAppVersionLastRunTimestamp, setCheckAppVersionLastRunTimestamp] = useState(Date.now());
  const location = useLocation();

  const { userAgent, currentUser, askPushNotifications } = useBranch({
    userAgent: ['userAgent'],
    currentUser: ['currentUser'],
    askPushNotifications: ['askPushNotifications'],
  });

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

    const isMobileApp = isUserAgentMobileApp(userAgent);

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

  const isMobileApp = isUserAgentMobileApp(userAgent);

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
      <AppRouter routes={routes} />
      <MobileAppEventListener />
      {askPushNotifications && (
        <EnablePushNotificationsModal
          onClose={() => {}}
        />
      )}
    </div>
  );
};

App.propTypes = {
  apiClient: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

export default App;
