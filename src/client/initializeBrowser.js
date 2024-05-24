/**
 * Entry point for the client application.
 *
 * This file initializes the client in the browser when required.
 * It is designated as the entry file in the Webpack configuration.
 *
 * Responsibilities:
 * - Bootstraps the client application
 * - Ensures proper initialization in the browser environment
 * - Configured as the entry point in Webpack
 */
import React from 'react';
import assert from 'assert';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'react-dom';

import createApiClient from 'api/createApiClient';
import { ANALYTICS_EVENT_USER_SESSION } from 'client/analytics/eventList';
import analytics from 'client/analytics';
import log from 'client/lib/log';
import getStoreFromBrowser from 'client/core/getStoreFromBrowser';
import initDevelopmentEnv from 'client/core/developmentEnv';
import './style/style.less';

assert(
  process.browser,
  'Only browsers are allowed to bootstrap the client'
);

log.info('Initializing browser client.');

// Gets the serialized state injected by the server.
// @see server/renderer
const store = getStoreFromBrowser();

// Initializes the development environment.
if (process.env.NODE_ENV !== 'production') {
  initDevelopmentEnv(store);
}

// Configures the analytics lib.
analytics.configure({
  store: store,
  _window: global.window,
});

// Track user visit.
analytics.identify();

if (store.get(['analytics', 'shouldTrackNewSession'])) {
  analytics.track(ANALYTICS_EVENT_USER_SESSION);
  store.set(['analytics', 'shouldTrackNewSession'], false);
}

// Loads the application in the DOM.
const containerNode = global.document.getElementById('react-container');

const renderAppInDOM = () => {
  const Root = require('./core/Root').default;

  // Inject API client.
  const apiClient = createApiClient({
    commitHash: store.get(['env', 'COMMIT_HASH']),
    apiPath: '/api/v1',
    sessionTokenName: 'X-Session-Token',
  });

  const rootedApp = (
    <BrowserRouter>
      <Root
        tree={store}
        apiClient={apiClient}
      />
    </BrowserRouter>
  );

  render(rootedApp, containerNode);
};

if (module.hot) {
  module.hot.accept('./core/Root', renderAppInDOM);
}

renderAppInDOM();
