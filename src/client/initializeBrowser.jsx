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
import './style/normalize.less';
import './style/fonts.less';
import './style/global.less';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { hydrateRoot } from 'react-dom/client';

import createApiClient from '#api/createApiClient.js';
import getStoreFromBrowser from '#client/core/getStoreFromBrowser.js';
import initDevelopmentEnv from '#client/core/developmentEnv.js';
import log from '#client/lib/log.js';
import Root from '#client/core/Root.jsx';

import { ANALYTICS_EVENT_USER_SESSION } from '#client/analytics/eventList.js';
import analytics from '#client/analytics/analytics.js';

const debug = log.debug('initializeBrowser');

debug(`Has root component? ${!!Root}`);

if (process.browser) {
  debug('Initializing browser client.');

  // Get the serialized state injected by the server
  const store = getStoreFromBrowser();

  // Initialize the development environment if not in production
  if (process.env.NODE_ENV !== 'production') {
    initDevelopmentEnv(store);
  }

  // Create API client
  const apiClient = createApiClient({
    commitHash: store.get(['env', 'COMMIT_HASH']),
    apiPath: '/api/v1',
    appUrl: store.get(['env', 'APP_URL']),
    sessionTokenName: 'X-Session-Token',
  });

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

  debug('Hydrating');
  const root = hydrateRoot(containerNode, (
    <BrowserRouter>
      <Root state={store} apiClient={apiClient} />
    </BrowserRouter>
  ));

  debug('Root mounted.');

  if (import.meta.hot) {
    module.meta.hot.accept('./core/Root.jsx', async () => {
      debug('Refreshing ./core/Root.jsx');
      const { default: Root } = await import('./core/Root.jsx');
      root.render((
        <BrowserRouter>
          <Root state={store} apiClient={apiClient} />
        </BrowserRouter>
      ));
    });
  }
}
