import { parse as parseUrl } from 'url';

import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server.js';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import createApiClient from '#api/createApiClient.js';

import makeInitialState from '#client/makeInitialState.js';
import createTree from '#client/core/createTree.js';
import AppContextProvider from '#client/contexts/AppContextProvider.jsx';
import routes, { router } from '#client/routes.jsx';
import renderLayout from '#client/renderLayout.js';

import {
  assertIdleApiState,
  makeRendererResponse,
  serializeState,
  matchRoute,
  createFetchRequest,
  fetchPageData,
} from '#server/renderer/rendererHelpers.js';

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

// TODO: Is it OK to leave this here?
console.log('Router', router);
let handler = createStaticHandler(router);

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
export default async function renderReactApp({ state: initialStateData, req, res, sessionToken }) {
  const initialState = { ...makeInitialState(), ...initialStateData };
  const url = req.originalUrl;

  const now = Date.now();
  debug(`Rendering client. URL: ${url}`);

  const state = createTree(initialState, {
    asynchronous: false,
    autoCommit: false,
    immutable: NODE_ENV !== 'production',
  });

  try {
    const { pathname, search: urlSearch = '' } = parseUrl(url);
    const { route, params, isNotFound } = matchRoute(routes, pathname);

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

    let redirectUrl = null;

    const { pageData, pageMetadata } = await fetchPageData({
      route,
      params,
      state,
      apiClient,
      navigate: (url) => {
        redirectUrl = url;
      },
      onNotFound: () => {
        state.state('isNotFound', true);
        httpStatus = 404;
      },
    });

    const pageMetadataWithDefaults = {
      ...DEFAULT_PAGE_METADATA,
      ...(pageMetadata || {}),
    };

    state.set('pageData', pageData || {});
    state.set('pageMetadata', pageMetadataWithDefaults);
    state.set('pageMetadataDefault', DEFAULT_PAGE_METADATA);

    if (redirectUrl) {
      debug(`\`navigate\` called with: ${redirectUrl}`);
      httpStatus = 302;
      state.release();

      return makeRendererResponse({
        status: httpStatus,
        redirectUrl,
      });
    }

    assertIdleApiState(state.get('apiState'));

    let fetchRequest = createFetchRequest(req, res);
    let context = await handler.query(fetchRequest);

    const staticRouter = createStaticRouter(handler.dataRoutes, context);

    const body = renderToString(
      React.createElement(AppContextProvider, { state, apiClient },
        React.createElement(StaticRouterProvider, { router: staticRouter, context })
      )
    );

    if (context.url) {
      debug(`Redirect to ${context.url}`);
      httpStatus = 302;
      state.release();

      return makeRendererResponse({
        status: httpStatus,
        redirectUrl: `${context.url}${urlSearch}`,
      });
    }

    const appUrl = new URL(APP_URL);

    const html = renderLayout({
      body,
      useBuild,
      devScriptBaseUrl: `${appUrl.protocol}//${appUrl.hostname}`,
      metaData: pageMetadataWithDefaults,
      segmentKey: SEGMENT_KEY,
      webpackDevelopmentServerPort: WEBPACK_DEVELOPMENT_SERVER_PORT || 8001,
      serializedState: serializeState(state),
      bundleSrc: useBuild
        ? `${AWS_BUNDLES_URL || ''}/js/bundle${COMMIT_HASH ? `-${COMMIT_HASH}` : ''}.js`
        : null,
      bundleStyleSrc: useBuild && NODE_ENV === 'production'
        ? `${AWS_BUNDLES_URL || ''}/css/style${COMMIT_HASH ? `-${COMMIT_HASH}` : ''}.css`
        : null,
    });

    state.release();

    debug(`Rendered in ${Date.now() - now}ms - HTML length: ${html.length}`);

    return makeRendererResponse({
      html,
      status: httpStatus,
    });
  } catch (error) {
    state.release();
    debug(`Rendering error: ${error.message}`);
    return makeRendererResponse({
      status: 500,
      error,
    });
  }
}
