import { parse as parseUrl } from 'url';
import { serializeError } from 'serialize-error';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import createApiClient from '#api/createApiClient.js';

import makeInitialState from '#client/makeInitialState.js';
import createTree from '#client/lib/tree.js';
import fetchPageData from '#client/core/fetchPageData.js';
import Root from '#client/core/Root.jsx';
import routes from '#client/routes.js';
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
  APP_URL,
  APP_TITLE,
  USE_BUILD,
  AWS_BUNDLES_URL,
  SEGMENT_KEY,
  COMMIT_HASH,
  WEBPACK_DEVELOPMENT_SERVER_PORT,
  HTML_ROBOTS_TAG,
} = process.env;

const useBuild = USE_BUILD === 'true';
const debug = logger.createDebug('renderer:renderReactApp');

const defaultMetas = {
  pageTitle: APP_TITLE,
  robots: HTML_ROBOTS_TAG,
};

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
export default async function renderReactApp({ state, url, sessionToken }) {
  state = { ...makeInitialState(), ...state };

  const tree = createTree(state, {
    asynchronous: false,
    autocommit: false,
    immutable: false,
  });

  const now = Date.now();
  debug(`Rendering client. URL: ${url}`);

  try {
    const context = {};

    const { pathname: urlWithoutQueryString, search: urlSearch = '' } = parseUrl(url);

    const branch = matchRoute(routes, urlWithoutQueryString);

    typeCheck('branch::NonEmptyArray', branch);

    const isNotFoundRoute = !branch[0].route.path;

    const apiClient = createApiClient({
      commitHash: COMMIT_HASH,
      getSessionToken: () => sessionToken,
      apiPath: '/api/v1',
      appUrl: APP_URL,
      sessionTokenName: 'X-Session-Token',
    });

    await fetchPageData(branch, {
      state: tree,
      apiClient,
      location: { search: urlSearch },
    });

    assertIdleApiState(tree.get('apiState'));

    const body = renderToString(
      React.createElement(
        StaticRouter,
        { location: url, context: context },
        React.createElement(Root, { tree: tree, apiClient: apiClient })
      )
    );

    if (context.url) {
      debug(`Redirect to ${context.url}`);
      tree.release();
      return makeRendererResponse({
        type: RENDERER_RESPONSE_TYPE_REDIRECT,
        redirectUrl: `${context.url}${urlSearch}`,
      });
    }

    const appUrl = new URL(APP_URL);

    const html = renderLayout({
      body,
      useBuild,
      devScriptBaseUrl: `${appUrl.protocol}//${appUrl.hostname}`,
      meta: { ...defaultMetas, ...(tree.get('pageMetadata') || {}) },
      segmentKey: SEGMENT_KEY,
      webpackDevelopmentServerPort: WEBPACK_DEVELOPMENT_SERVER_PORT || 8001,
      serializedState: serializeState(tree),
      bundleSrc: useBuild
        ? `${AWS_BUNDLES_URL || ''}/js/bundle${COMMIT_HASH ? `-${COMMIT_HASH}` : ''}.js`
        : null,
      bundleStyleSrc: useBuild && NODE_ENV === 'production'
        ? `${AWS_BUNDLES_URL || ''}/css/style${COMMIT_HASH ? `-${COMMIT_HASH}` : ''}.css`
        : null,
    });

    tree.release();

    debug(`Rendered in ${Date.now() - now}ms - HTML length: ${html.length}`);

    return makeRendererResponse({
      type: isNotFoundRoute
        ? RENDERER_RESPONSE_TYPE_NOT_FOUND
        : RENDERER_RESPONSE_TYPE_SUCCESS,
      html,
    });
  } catch (error) {
    tree.release();
    debug(`Rendering error: ${error.message}`);
    return makeRendererResponse({
      type: RENDERER_RESPONSE_TYPE_ERROR,
      error: serializeError(error),
    });
  }
}

/**
 * Match the route against the routes array, including dynamic segments.
 * @param {Array} routes Array of route objects.
 * @param {String} pathname URL pathname to match.
 * @return {Array} Array containing the matched route and params.
 */
function matchRoute(routes, pathname) {
  let notFoundRoute = null;

  for (const route of routes) {
    const { path } = route;
    if (!path) {
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

      return [{ route, params }];
    }
  }
  if (notFoundRoute) {
    return [{
      route: notFoundRoute,
      params: {},
    }];
  }

  return [];
}
