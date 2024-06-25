import jsesc from 'jsesc';
import assert from 'assert';

import typeCheck from '#common/util/typeCheck.js';
import makeDispatchFn from '#client/core/makeDispatchFn.js';

const {
  APP_URL,
} = process.env;

/**
 * Checks that all API requests have completed and throws an error if any are still in progress.
 */
export function assertIdleApiState(apiState) {
  Object.keys(apiState).forEach((actionType) => {
    Object.keys(apiState[actionType]).forEach((apiStateQueryId) => {
      if (apiState[actionType][apiStateQueryId].inProgress === true) {
        const error = new Error(
          `API request still in progress: ${actionType}:${apiStateQueryId}`
        );
        error.name = 'ClientRenderApiRequestInProgressError';
        error.details = {
          apiState,
        };
        throw error;
      }
    });
  });
}

/**
 * Creates a standardized renderer response object, validating input types.
 */
export function makeRendererResponse({ status, html, redirectUrl, error }) {
  typeCheck('status::PositiveNumber', status);
  typeCheck('html::Maybe NonEmptyString', html);
  typeCheck('redirectUrl::Maybe NonEmptyString', redirectUrl);
  assert(html || redirectUrl || error, 'html, redirectUrl or error is required.');

  return {
    status: status,
    html: html || null,
    redirectUrl: redirectUrl || null,
    error: error || null,
  };
}

/**
 * Serializes the application state, removing any Baobab "monkeys" from the state tree.
 */
export function serializeState(state) {
  const stateWithoutMonkeys = withoutMonkeys(state.get());
  return jsesc(JSON.stringify(stateWithoutMonkeys));
}

/**
 * Recursively removes Baobab "monkeys" (dynamic facets) from the given object.
 */
export function withoutMonkeys(object) {
  return Object.keys(object).reduce((acc, key) => {
    if (key[0] === '$') {
      return acc;
    }
    if (!object[key] || typeof object[key] !== 'object' || Array.isArray(object[key])) {
      return {
        ...acc,
        [key]: object[key],
      };
    }
    return {
      ...acc,
      [key]: withoutMonkeys(object[key]),
    };
  }, {});
}

/**
 * Runs data fetching functions defined in the router state's component tree.
 */
export const fetchPageData = async ({ route, params, state, apiClient, navigate, onNotFound }) => {
  let pageData = null;
  let pageMetadata = null;

  if (route.Component?.fetchPageData) {
    pageData = await route.Component.fetchPageData({
      dispatch: makeDispatchFn({
        state,
        apiClient,
        navigate,
      }),
      onNotFound,
      params: params || {},
    });
  }

  if (route.Component?.getMetadata) {
    pageMetadata = route.Component.getMetadata({
      state,
      params: params || {},
    });
  }

  return {
    pageData,
    pageMetadata,
  };
}

/**
 * Creates a Fetch API Request object from an Express request and response.
 */
export const createFetchRequest = (req, res) => {
  console.log('[createFetchRequest] req.headers');
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
 * @param {string} pathname URL pathname to match.
 *
 * @return {Object} The matched route and params.
 */
export const matchRoute = (routes, pathname) => {
  console.log('pathname');
  console.log(pathname);
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
