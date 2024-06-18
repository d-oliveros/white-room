import { parse as parseUrl } from 'url';
import { serializeError } from 'serialize-error';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import createApiClient from '#api/createApiClient.js';

import makeInitialState from '#client/makeInitialState.js';
import makeDispatchFn from '#client/core/makeDispatchFn.js';
import createTree from '#client/core/createTree.js';
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
const fetchPageData = async ({ branch, state, apiClient, navigate }) => {
  await Promise.all(branch
    .filter(({ route }) => route.component?.fetchPageData)
    .map(({ route, match }) => route.component.fetchPageData({
      dispatch: makeDispatchFn({
        state,
        apiClient,
        navigate,
      }),
      // TODO: Enable
      // params: match.params,
      params: null,
    }))
  );

  return {
    pageMetadata: setComponentsMetadata(branch, {
      state,
      apiClient,
      navigate,
    }),
  };
}


/**
 * Changes the state's metadata object
 *
 * @param  {Array}  branch An array of components to be rendered.
 * @param  {Object} inject The application's state.
 */
function setComponentsMetadata(branch, inject) {
  const [getMetadata] = branch
    .filter(({ route }) => route.component?.getMetadata)
    .map(({ route }) => route.component.getMetadata);

  try {
    const componentMetadata = !getMetadata ? null : getMetadata({
      state: inject.state,
      // TODO: Enable
      // params: match.params,
      params: null,
    });

    const pageMetadata = {
      ...DEFAULT_PAGE_METADATA,
      ...(componentMetadata || {}),
    };
    inject.state.set('pageMetadata', pageMetadata);
    inject.state.set('pageMetadataDefault', DEFAULT_PAGE_METADATA);

    return pageMetadata;
  }
  catch (metadataGetterError) {
    const error = new Error(`Error while generating page metatags: ${metadataGetterError.message}`);
    error.name = 'PageMetadataGenerationError';
    error.details = {
      state: inject.state.get(),
      stringifiedMetadataGetterFunction: !getMetadata ? null : getMetadata.toString(),
    };
    error.inner = serializeError(metadataGetterError);
    logger.error(error);
  }
  return null;
}

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
export default async function renderReactApp({ state: _state, url, sessionToken }) {
  const initialState = { ...makeInitialState(), ..._state };

  const state = createTree(initialState, {
    asynchronous: false,
    autoCommit: false,
    immutable: NODE_ENV !== 'production',
  });

  const now = Date.now();
  debug(`Rendering client. URL: ${url}`);

  try {
    const context = {};

    const {
      pathname: urlWithoutQueryString,
      search: urlSearch = '',
    } = parseUrl(url);

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

    let redirectUrl = null;
    const { pageMetadata } = await fetchPageData({
      branch,
      state,
      apiClient,
      navigate: (url) => {
        redirectUrl = url;
      },
    });

    if (redirectUrl) {
      debug(`\`navigate\` called with: ${redirectUrl}`);
      state.release();
      return makeRendererResponse({
        type: RENDERER_RESPONSE_TYPE_REDIRECT,
        redirectUrl,
      });
    }

    assertIdleApiState(state.get('apiState'));

    const body = renderToString(
      React.createElement(
        StaticRouter,
        { location: url, context: context },
        React.createElement(Root, { state, apiClient })
      )
    );

    if (context.url) {
      debug(`Redirect to ${context.url}`);
      state.release();
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
      metaData: pageMetadata,
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
      type: isNotFoundRoute
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
