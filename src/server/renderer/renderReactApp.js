import { parse as parseUrl } from 'url';
import { serializeError } from 'serialize-error';

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
import makeDispatchFn from '#client/core/makeDispatchFn.js';
import createTree from '#client/core/createTree.js';
import AppContextProvider from '#client/contexts/AppContextProvider.jsx';
import routes, { router } from '#client/routes.jsx';
import renderLayout from '#client/renderLayout.js';

import {
  assertIdleApiState,
  makeRendererResponse,
  serializeState,
} from '#server/renderer/rendererHelpers.js';

import {
  RENDERER_RESPONSE_TYPE_SUCCESS,
  RENDERER_RESPONSE_TYPE_REDIRECT,
  RENDERER_RESPONSE_TYPE_NOT_FOUND,
  RENDERER_RESPONSE_TYPE_ERROR,
} from '#server/renderer/rendererResponseTypes.js';

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

/**
 * Runs the data fetching functions defined in the router state's component tree.
 */
const fetchPageData = async ({ route, params, state, apiClient, navigate, onNotFound }) => {
  let pageData = null;
  let pageMetadata = null;

  const routeComponent = route.Component
    ? (await route.Component).default
    : null;

  console.log('routeComponent');
  console.log(routeComponent);

  if (routeComponent?.fetchPageData) {
    pageData = await routeComponent.fetchPageData({
      dispatch: makeDispatchFn({
        state,
        apiClient,
        navigate,
      }),
      onNotFound,
      params: params || {},
    });
  }

  if (routeComponent?.getMetadata) {
    pageMetadata = routeComponent.getMetadata({
      state,
      params: params || {},
    });
  }

  return {
    pageData,
    pageMetadata,
  };
}

const createFetchRequest = (req, res) => {
  console.log('req.headers');
  console.log(req.headers);
  // Note: This had to take originalUrl into account for presumably vite's proxying
  const url = new URL(req.originalUrl || req.url, APP_URL);

  const controller = new AbortController();
  res.on('close', () => controller.abort());

  const headers = new Headers();

  for (const [key, values] of Object.entries(req.headers)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  const init = {
    method: req.method,
    headers,
    signal: controller.signal,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body;
  }

  return new Request(url.href, init);
}

/**
 * Match the route against the routes array, including dynamic segments.
 *
 * @param {Array} routes Array of route objects.
 * @param {String} pathname URL pathname to match.
 *
 * @return {Object} The matched route and params.
 */
const matchRoute = (routes, pathname) => {
  let notFoundRoute = null;

  for (const route of routes) {
    const { path } = route;
    if (path === '*') {
      notFoundRoute = route;
      continue;
    }
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPath}$`);
    const match = pathname.match(regex);

    if (match) {
      const params = match.slice(1).reduce((acc, value, index) => {
        acc[paramNames[index]] = value;
        return acc;
      }, {});

      return {
        route,
        params,
        isNotFound: false,
      };
    }
  }
  if (notFoundRoute) {
    return {
      route: notFoundRoute,
      params: {},
      isNotFound: true,
    };
  }

  return null;
};

// TODO: Is it OK to leave this here?
console.log('router');
console.log(router);
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
export default async function renderReactApp({ state: _state, req, res, sessionToken }) {
  const initialState = { ...makeInitialState(), ..._state };
  const url = req.originalUrl;

  const state = createTree(initialState, {
    asynchronous: false,
    autoCommit: false,
    immutable: NODE_ENV !== 'production',
  });

  const now = Date.now();
  debug(`Rendering client. URL: ${url}`);

  try {
    const { pathname, search: urlSearch = '' } = parseUrl(url);
    const { route, params, isNotFound } = matchRoute(routes, pathname);

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

    console.log('DOING', url);
    console.log('route');
    console.log(route);

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
        isNotFound = true;
      },
    });

    const pageMetadataWithDefaults = {
      ...DEFAULT_PAGE_METADATA,
      ...(pageMetadata || {}),
    };

    state.set('pageData', pageData || {});
    state.set('pageMetadata', pageMetadataWithDefaults);
    state.set('pageMetadataDefault', DEFAULT_PAGE_METADATA);
    console.log('AAAs')

    if (redirectUrl) {
      debug(`\`navigate\` called with: ${redirectUrl}`);
      state.release();
      return makeRendererResponse({
        type: RENDERER_RESPONSE_TYPE_REDIRECT,
        redirectUrl,
      });
    }

    assertIdleApiState(state.get('apiState'));

    let fetchRequest = createFetchRequest(req, res);
    let context = await handler.query(fetchRequest);

    console.log('er');
    console.log(handler.dataRoutes);
    const staticRouter = createStaticRouter(handler.dataRoutes, context);
    console.log('Or');

    const body = renderToString(
      React.createElement(AppContextProvider, { state, apiClient },
        React.createElement(StaticRouterProvider, { router: staticRouter, context })
      )
    );

    console.log('Ur');
    if (context.url) {
      debug(`Redirect to ${context.url}`);
      state.release();
      return makeRendererResponse({
        type: RENDERER_RESPONSE_TYPE_REDIRECT,
        redirectUrl: `${context.url}${urlSearch}`,
      });
    }

    console.log('A')
    const appUrl = new URL(APP_URL);
    console.log('bB')

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
      type: isNotFound
        ? RENDERER_RESPONSE_TYPE_NOT_FOUND
        : RENDERER_RESPONSE_TYPE_SUCCESS,
      html,
    });
  } catch (error) {
    state.release();
    debug(`Rendering error: ${error.message}`);
    return makeRendererResponse({
      type: RENDERER_RESPONSE_TYPE_ERROR,
      error: serializeError(error),
    });
  }
}
