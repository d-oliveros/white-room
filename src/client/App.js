import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { LastLocationProvider } from 'react-router-last-location';
import { withRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import queryString from 'query-string';

import isUserAgentMobileApp, {
  isUserAgentIphoneApp,
} from 'common/util/isUserAgentMobileApp';

import {
  hasRoleAnonymous,
} from 'common/userRoles';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED,
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from 'client/helpers/sendDataToMobileApp';

import { API_ACTION_GET_APP_COMMIT_HASH } from 'api/actionTypes';

import branch from 'client/core/branch';
import MobileAppEventListener from 'client/components/MobileAppEventListener/MobileAppEventListener';
import EnablePushNotificationsModal from 'client/components/EnablePushNotificationsModal/EnablePushNotificationsModal';

// Interval for checking the app commit hash vs the server commit hash to reload the page when a new version is available.
const CHECK_APP_VERSION_INTERVAL_MS = 1800000; // 30 minutes.

@withRouter
@branch({
  currentUser: ['currentUser'],
  tours: ['tours'],
  userAgent: ['analytics', 'userAgent'],
  askPushNotifications: ['mobileApp', 'askPushNotifications'],
})
class App extends Component {
  static propTypes = {
    apiClient: PropTypes.object,
    userAgent: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    routes: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this._checkAppVersionInterval = null;
    this._checkAppVersionLastRunTimestamp = Date.now();
    this.historyUnlisten = null;
  }

  componentDidMount() {
    global.document.addEventListener('wheel', () => {
      if (global.document.activeElement.type === 'number') {
        global.document.activeElement.blur();
      }
    });
    if (!this._checkAppVersionInterval) {
      this._checkAppVersionInterval = global.setInterval(() => {
        // Avoid doing unnecesary API calls if the app is not focused (not visible).
        if (global.document && global.document.hidden) {
          return;
        }
        const now = Date.now();
        if (now - this._checkAppVersionLastRunTimestamp > CHECK_APP_VERSION_INTERVAL_MS) {
          this._checkAppVersionLastRunTimestamp = now;
          // The API client automatically compares the commit hash returned by the server in res.header['x-app-commit-hash'],
          // and refresh the browser if the commit hash the app was loaded from does not match the server's commit hash.
          this.props.apiClient.post(API_ACTION_GET_APP_COMMIT_HASH);
        }
      }, 1000);
    }

    const { currentUser, history, userAgent } = this.props;
    const isMobileApp = isUserAgentMobileApp(userAgent);

    if (isMobileApp) {
      if (!hasRoleAnonymous(currentUser.roles)) {
        sendDataToMobileApp({
          actionType: MOBILE_APP_ACTION_TYPE_CURRENT_USER,
          currentUser: currentUser,
        });
      }

      this.historyUnlisten = history.listen((location) => {
        sendDataToMobileApp({
          actionType: MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED,
          routePath: location.pathname,
          routeQuery: queryString.parse(location.search || ''),
          currentUser: currentUser,
        });
      });
    }
  }

  componentWillUnmount() {
    global.clearInterval(this._checkAppVersionInterval);
    this._checkAppVersionInterval = null;
    if (this.historyUnlisten) {
      this.historyUnlisten();
    }
  }

  render() {
    const {
      userAgent,
      routes,
      askPushNotifications,
    } = this.props;

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
        <LastLocationProvider>
          {renderRoutes(routes)}
        </LastLocationProvider>
        <MobileAppEventListener />
        {askPushNotifications && (
          <EnablePushNotificationsModal
            onClose={() => {}}
          />
        )}
      </div>
    );
  }
}

export default App;
