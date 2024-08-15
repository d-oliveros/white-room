import { parse as parseUrl } from 'url';
import lodashMerge from 'lodash/fp/merge.js';

import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server.js';

import logger from '#whiteroom/logger.js';
import typeCheck from '#whiteroom/util/typeCheck.js';
import isRedirectResponse from '#whiteroom/util/isRedirectResponse.js';

import createApiClient from '#whiteroom/api/createApiClient.js';
import createReactQueryClient from '#whiteroom/client/helpers/createReactQueryClient.js';
import createStore from '#whiteroom/client/core/createStore.js';
import makeDispatchFn from '#whiteroom/client/core/makeDispatchFn.js';
import makeInitialState from '#whiteroom/client/makeInitialState.js';

import AppContextProvider from '#whiteroom/client/contexts/AppContextProvider.jsx';
import makeRouter from '#whiteroom/client/core/makeRouter.jsx';
import renderLayout from '#whiteroom/renderer/renderLayout.js';

import {
  assertIdleApiState,
  makeRendererResponse,
  serializeState,
  matchRoute,
  createFetchRequest,
} from '#whiteroom/renderer/rendererHelpers.js';

const {
  NODE_ENV,
  APP_ID,
  APP_TITLE,
  APP_URL,
  USE_BUILD,
  AWS_BUNDLES_URL,
  SEGMENT_KEY,
  COMMIT_HASH,
  WEBPACK_DEVELOPMENT_SERVER_PORT,
} = process.env;

const useBuild = USE_BUILD === 'true';
const debug = logger.createDebug('renderer:renderReactApp');

const DEFAULT_PAGE_METADATA = {
  pageTitle: APP_TITLE,
  robots: 'index,follow',
  keywords: [APP_TITLE, APP_ID].filter(Boolean).join(', '),
  description:  `${APP_TITLE}.`,
  image: null,
};

// const routesLoaded = await Promise.all(router.map(async (route) => ({
//   ...route,
//   component: route.component instanceof Promise
//     ? (await route.component).default
//     : route.component,
// })));

// console.log('routesLoaded');
// console.log(routesLoaded);

// let handler = createStaticHandler(routesLoaded);

/**
 * Renders the client on server-side.
 *
 * Gets the initial state from req.body, makes the initial client render,
 * builds and returns the fully-rendered HTML.
 *
 * @param  {Object} options.state Initial client state.
 * @param  {String} options.url   Requested URL.
 * @param  {String} options.sessionToken Session token.
 * @return {Object}               Object with { type, html, redirectUrl, error }.
 */
export default async function renderReactApp({ state: initialStateData, req, res, sessionToken, routes }) {
  const initialState = lodashMerge(makeInitialState(), initialStateData);
  const url = req.originalUrl;

  const now = Date.now();
  debug(`Rendering client. URL: ${url}`);

  const store = createStore(initialState, {
    asynchronous: false,
    autoCommit: false,
    immutable: NODE_ENV !== 'production',
  });

  try {
    const { pathname, search: urlSearch = '' } = parseUrl(url);
    const { route, isNotFound } = matchRoute(routes, pathname);

    let httpStatus = isNotFound ? 404 : 200;

    typeCheck('route::NonEmptyObject', route, {
      errorMessage: `No default route configured.`,
    });

    const apiClient = createApiClient({
      commitHash: COMMIT_HASH,
      getSessionToken: () => sessionToken,
      apiPath: '/api/v1',
      appUrl: APP_URL,
      sessionTokenName: 'X-Session-Token',
    });

    const dispatch = makeDispatchFn({ state: store, apiClient });

    // Server-side react query client
    const queryClient = createReactQueryClient({
      apiClient,
    });

    let redirectUrl = null;

    const pageMetadataWithDefaults = {
      ...DEFAULT_PAGE_METADATA,
      // ...(pageMetadata || {}),
    };

    store.set(['client', 'pageMetadata'], pageMetadataWithDefaults);
    store.set(['client', 'pageMetadataDefault'], DEFAULT_PAGE_METADATA);

    // TODO: Navigate on fetchPageData
    if (redirectUrl) {
      debug(`\`navigate\` called with: ${redirectUrl}`);
      httpStatus = 302;
      store.release();

      return makeRendererResponse({
        status: httpStatus,
        redirectUrl,
      });
    }

    assertIdleApiState(store.get(['client', 'apiState']));

    const router = makeRouter({
      routes,
      queryClient,
      apiClient,
      dispatch,
      store,
    });

    let fetchRequest = createFetchRequest(req, res);

    console.log('Router', router);
    let handler = createStaticHandler(router);
    let context = await handler.query(fetchRequest);

    // console.log('CONTEXT IS');
    // console.log(context);

    if (isRedirectResponse(context)) {
      httpStatus = context.statusCode;

      if (httpStatus === 404) {
        console.log('IS 404');
      }
      else {
        const url = context.headers.get('Location');
        store.release();

        debug(`Redirect to ${url}`);

        return makeRendererResponse({
          status: httpStatus,
          redirectUrl: url,
        });
      }
    }

    const staticRouter = createStaticRouter(handler.dataRoutes, context);

    const renderedReactAppHtml = renderToString(
      React.createElement(AppContextProvider, { store, apiClient, queryClient, dispatch },
        React.createElement(StaticRouterProvider, { router: staticRouter, context })
      )
    );

    if (context.url) {
      debug(`Redirect to ${context.url}`);
      httpStatus = 302;
      store.release();

      return makeRendererResponse({
        status: httpStatus,
        redirectUrl: `${context.url}${urlSearch}`,
      });
    }

    const appUrl = new URL(APP_URL);

    const html = renderLayout({
      renderedReactAppHtml,
      useBuild,
      devScriptBaseUrl: `${appUrl.protocol}//${appUrl.hostname}`,
      // metaData: pageMetadataWithDefaults,
      segmentKey: SEGMENT_KEY,
      webpackDevelopmentServerPort: WEBPACK_DEVELOPMENT_SERVER_PORT || 8001,
      serializedState: serializeState(store),
      bundleSrc: useBuild
        ? `${AWS_BUNDLES_URL || ''}/js/bundle${COMMIT_HASH ? `-${COMMIT_HASH}` : ''}.js`
        : null,
      bundleStyleSrc: useBuild && NODE_ENV === 'production'
        ? `${AWS_BUNDLES_URL || ''}/css/style${COMMIT_HASH ? `-${COMMIT_HASH}` : ''}.css`
        : null,
    });

    store.release();

    debug(`Rendered in ${Date.now() - now}ms - HTML length: ${html.length}`);

    return makeRendererResponse({
      html,
      status: httpStatus,
    });
  } catch (error) {
    store.release();
    debug(`Rendering error: ${error.message}`);
    return makeRendererResponse({
      status: 500,
      error,
    });
  }
}
