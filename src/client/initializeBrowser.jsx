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

import React, { Suspense } from 'react';
import { RouterProvider, createBrowserRouter, matchRoutes } from 'react-router-dom';
import { hydrateRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query'

import log from '#client/lib/log.js';
import createApiClient from '#api/createApiClient.js';
import getStoreFromBrowser from '#client/core/getStoreFromBrowser.js';
import initDevelopmentEnv from '#client/core/developmentEnv.js';
import AppContextProvider from '#client/contexts/AppContextProvider.jsx';
import makeRouter from '#client/core/makeRouter.jsx';
import routes from '#client/routes.js';

import { ANALYTICS_EVENT_USER_SESSION } from '#client/analytics/eventList.js';
import analytics from '#client/analytics/analytics.js';

const debug = log.debug('initializeBrowser');

debug(`Has root component? ${!!AppContextProvider}`);

if (process.browser) {
  debug('Initializing browser client.');

  // Get the serialized state injected by the server
  const store = getStoreFromBrowser();

  console.log(process.env.NODE_ENV);
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

  // Get the container node where the app  will be mounted
  const containerNode = global.document.getElementById('react-container');

  debug('Hydrating');

  // When Serverside-Rendering, the matching rout is already served by the server.
  // However, given that it is lazy, it is possible that the modules are not loaded yet,
  // leading to a loading state being shown.
  // Instead, we will wait until those modules are loaded before hydrating the client-side.

  // Determine if any of the initial routes are lazy
  let lazyMatches = matchRoutes(
    routes,
    window.location
  )?.filter((m) => m.route.lazy);

  // Load the lazy matches and update the routes before creating your router
  // so we can hydrate the SSR-rendered content synchronously
  if (lazyMatches && lazyMatches?.length > 0) {
    console.log('IS LAZY MATCH', lazyMatches, Date.now());
    await Promise.all(
      lazyMatches.map(async (m) => {
        let routeModule = await m.route.lazy();
        Object.assign(m.route, {
          ...routeModule,
          lazy: undefined,
        });
      })
    );
    console.log('Done...??', Date.now());
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });

  const router = makeRouter({
    routes,
    store,
    apiClient,
    queryClient,
  });

  const root = hydrateRoot(containerNode, (
    <AppContextProvider state={store} apiClient={apiClient} queryClient={queryClient}>
      <RouterProvider router={createBrowserRouter(router)} />
    </AppContextProvider>
  ));

  debug('Root mounted.');

  if (import.meta.hot) {
    module.meta.hot.accept('./contexts/AppContextProvider.jsx', async () => {
      debug('Refreshing ./contexts/AppContextProvider.jsx');
      const { default: AppContextProvider } = await import('./contexts/AppContextProvider.jsx');
      const { default: makeRouter } = await import('./core/makeRouter.jsx');

      const router = makeRouter({
        store,
        apiClient,
        queryClient,
      });

      root.render(
        <AppContextProvider state={state} apiClient={apiClient} queryClient={queryClient}>
          <RouterProvider router={createBrowserRouter(router)} />
        </AppContextProvider>
      );
    });
  }
}
