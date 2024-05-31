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
import { hydrateRoot } from 'react-dom/client';

import createApiClient from '#api/createApiClient.js';
import getStoreFromBrowser from '#client/core/getStoreFromBrowser.js';
import initDevelopmentEnv from '#client/core/developmentEnv.js';
import log from '#client/lib/log.js';

import { ANALYTICS_EVENT_USER_SESSION } from '#client/analytics/eventList.js';
import analytics from '#client/analytics/analytics.js';

import '#client/style/style.less';

// Ensure the code runs only in the browser environment
assert(process.browser, 'Only browsers are allowed to bootstrap the client');

log.info('Initializing browser client.');

// Get the serialized state injected by the server
const store = getStoreFromBrowser();

// Initialize the development environment if not in production
if (process.env.NODE_ENV !== 'production') {
  initDevelopmentEnv(store);
}

// Configure the analytics library
analytics.configure({
  store,
  _window: global.window,
});

// Track user visit
analytics.identify();

if (store.get(['analytics', 'shouldTrackNewSession'])) {
  analytics.track(ANALYTICS_EVENT_USER_SESSION);
  store.set(['analytics', 'shouldTrackNewSession'], false);
}

// Get the container node where the app will be mounted
const containerNode = global.document.getElementById('react-container');

const renderAppInDOM = () => {
  const Root = require('./core/Root.jsx').default;

  // Inject API client
  const apiClient = createApiClient({
    commitHash: store.get(['env', 'COMMIT_HASH']),
    apiPath: '/api/v1',
    sessionTokenName: 'X-Session-Token',
  });

  const rootedApp = (
    <BrowserRouter>
      <Root tree={store} apiClient={apiClient} />
    </BrowserRouter>
  );

  hydrateRoot(containerNode, rootedApp);
};

if (module.hot) {
  module.hot.accept('./core/Root.jsx', renderAppInDOM);
}

renderAppInDOM();
