import { parse as parseUrl } from 'url';
import { serializeError } from 'serialize-error';
import defaults from 'lodash/fp/defaults.js';
import handlebars from 'handlebars';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { matchRoutes } from 'react-router-config';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import createApiClient from '#api/createApiClient.js';

import makeInitialState from '#client/makeInitialState.js';
import createTree from '#client/lib/tree.js';
import fetchPageData from '#client/core/fetchPageData.js';
import Root from '#client/core/Root.js';
import routes from '#client/routes.js';

import {
  getTemplateFile,
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
  WEBPACK_DEVELOPMENT_SERVER_PUBLIC_PORT,
  HTML_ROBOTS_TAG,
} = process.env;

const useBuild = USE_BUILD === 'true';
const buildHtml = handlebars.compile(getTemplateFile());

const debug = logger.createDebug('renderer:renderReactApp');

const defaultMetas = {
  pageTitle: APP_TITLE,
  robots: HTML_ROBOTS_TAG,
};

/**
 * Renders the client on server-side.
 *
 * Gets the initial state from req.body, makes the inital client render,
 * builds and returns the fully-rendered html.
 *
 * @param  {Object} options.state Initial client state.
 * @param  {String} options.url   Requested URL.
 * @return {Object}               Object with { type, html, redirectUrl, error }.
 */
export default async function renderReactApp({ state, url, sessionToken }) {
  state = Object.assign(makeInitialState(), state || {});

  // Instanciates the client's state tree.
  const tree = createTree(state, {
    asynchronous: false,
    autocommit: false,
    immutable: false,
  });

  const now = Date.now();
  debug(`Rendering client. Url: ${url}`);

  try {
    const context = {};

    const urlWithoutQueryString = parseUrl(url).pathname;
    const urlSearch = parseUrl(url).search || '';
    const branch = matchRoutes(routes, urlWithoutQueryString);

    typeCheck('branch::NonEmptyArray', branch);

    const isNotFoundRoute = !branch[0].route.path;

    const apiClient = createApiClient({
      commitHash: COMMIT_HASH,
      getSessionToken: () => sessionToken,
      apiPath: '/api/v1',
      sessionTokenName: 'X-Session-Token',
    });
    await fetchPageData(branch, {
      state: tree,
      apiClient: apiClient,
      location: {
        search: urlSearch,
      },
    });

    // Ensure no API requests are still in progress.
    assertIdleApiState(tree.get('apiState'));

    // Serializes the application to HTML.
    const body = ReactDOMServer.renderToString(
      <StaticRouter
        location={url}
        context={context}
      >
        <Root
          tree={tree}
          apiClient={apiClient}
        />
      </StaticRouter>
    );

    if (context.url) {
      debug(`Redirect to ${context.url}`);
      tree.release();
      return makeRendererResponse({
        type: RENDERER_RESPONSE_TYPE_REDIRECT,
        redirectUrl: `${context.url}${urlSearch}`,
      });
    }

    // Builds the full page's HTML.
    const html = buildHtml({
      body: body,
      useBuild: useBuild,
      hostname: APP_URL.replace(/:[0-9]{1,4}.(.*)/, ''),
      meta: defaults(defaultMetas, tree.get('pageMetadata') || {}),
      segmentKey: SEGMENT_KEY,
      webpackDevelopmentServerPort: WEBPACK_DEVELOPMENT_SERVER_PUBLIC_PORT || WEBPACK_DEVELOPMENT_SERVER_PORT,
      serializedState: serializeState(tree),
      bundleSrc: useBuild
        ? AWS_BUNDLES_URL
          ? `${AWS_BUNDLES_URL}/js/bundle${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.js`
          : `/dist/bundle${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.js`
        : null,
      bundleStyleSrc: useBuild && NODE_ENV === 'production'
        ? AWS_BUNDLES_URL
          ? `${AWS_BUNDLES_URL}/css/style${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.css`
          : `/dist/style${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.css`
        : null,
    });

    tree.release();

    debug(`Rendered in ${Date.now() - now}ms - HTML length: ${html.length}`);

    return makeRendererResponse({
      type: isNotFoundRoute
        ? RENDERER_RESPONSE_TYPE_NOT_FOUND
        : RENDERER_RESPONSE_TYPE_SUCCESS,
      html: html,
    });
  }
  catch (error) {
    tree.release();
    return makeRendererResponse({
      type: RENDERER_RESPONSE_TYPE_ERROR,
      error: serializeError(error),
    });
  }
}
