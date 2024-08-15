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
import { RouterProvider, createBrowserRouter, matchRoutes } from 'react-router-dom';
import createDebug from 'debug';
import { hydrateRoot } from 'react-dom/client';
import he from 'he';

import createApiClient from '#white-room/api/createApiClient.js';
import createReactQueryClient from '#white-room/client/helpers/createReactQueryClient.js';
import createStore from '#white-room/client/core/createStore.js';
import initDevelopmentEnv from '#white-room/client/core/developmentEnv.js';
import makeDispatchFn from '#white-room/client/core/makeDispatchFn.js';
import AppContextProvider from '#white-room/client/contexts/AppContextProvider.jsx';
import makeRouter from '#white-room/client/core/makeRouter.jsx';
import parseJSON from '#white-room/util/parseJSON.js';

import { ANALYTICS_EVENT_USER_SESSION } from '#white-room/client/analytics/eventList.js';
import analytics from '#white-room/client/analytics/analytics.js';

// TODO: Implement dynamic loading of routes! Or inject routes object!
import routes from '#app/routes.js';
import './style/tailwind.css';

const debug = createDebug('initializeBrowser');

debug(`Has root component? ${!!AppContextProvider}`);

if (process.browser) {
  debug('Initializing browser client.');

  const state = global.__INITIAL_STATE__
    ? parseJSON(he.decode(global.__INITIAL_STATE__))
    : {};

  console.log('Initial Client State', state);

  const {
    NODE_ENV,
    COMMIT_HASH,
    APP_URL,
   } = state.client.env || {};

  // Get the serialized state
  const store = createStore(state, {
    immutable: NODE_ENV !== 'production',
  });

  // Initialize the development environment if not in production
  if (NODE_ENV !== 'production') {
    initDevelopmentEnv(store);
  }

  // Create API client
  const apiClient = createApiClient({
    commitHash: COMMIT_HASH,
    apiPath: '/api/v1',
    appUrl: APP_URL,
    sessionTokenName: 'X-Session-Token',
  });

  const dispatch = makeDispatchFn({ state: store, apiClient });

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

  const queryClient = createReactQueryClient({
    apiClient,
  });

  const router = makeRouter({
    routes,
    store,
    apiClient,
    queryClient,
  });

  const root = hydrateRoot(containerNode, (
    <AppContextProvider {...{ store, apiClient, queryClient, dispatch }}>
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
        <AppContextProvider {...{ store, apiClient, queryClient, dispatch }}>
          <RouterProvider router={createBrowserRouter(router)} />
        </AppContextProvider>
      );
    });
  }
}
