import { serializeError } from 'serialize-error';
import withoutLeadingSlash from '#white-room/util/withoutLeadingSlash.js';

import {
  API_ERROR_REQUEST_INVALID_RESPONSE,
  API_ERROR_REQUEST_FAILED,
} from '#white-room/constants/errorCodes.js';

import typeCheck from '#white-room/util/typeCheck.js';
import logger from '#white-room/logger.js';

const debug = logger.createDebug('api:client');

function makeApiRequestMethod({
  method,
  commitHash,
  getSessionToken,
  onCommitHashChange,
  apiBasePath,
  appUrl,
  sessionTokenName,
}) {
  return async function apiRequest(path, actionPayload, actionOptions = {}) {
    typeCheck('path::NonEmptyString', path);
    typeCheck('actionPayload::Maybe Object', actionPayload);
    typeCheck('getSessionToken::Maybe Function', getSessionToken);
    typeCheck('actionOptions::Object', actionOptions);

    debug(`Requesting ${apiBasePath}/${path}`, actionPayload);

    path = withoutLeadingSlash(path);

    let url = `${appUrl}${apiBasePath}/${path}`;
    const sessionToken = getSessionToken ? getSessionToken() : null;

    const options = {
      method: method.toUpperCase(),
      headers: {}
    };

    if (sessionToken) {
      options.headers[sessionTokenName] = sessionToken;
    }

    if (actionOptions.timeout) {
      options.timeout = actionOptions.timeout;
    }

    if (method === 'get' && actionPayload) {
      const query = new URLSearchParams(actionPayload).toString();
      url += `?${query}`;
    }
    else if (method === 'post') {
      options.headers['Content-Type'] = 'application/json';
      if (actionPayload) {
        options.body = JSON.stringify(actionPayload);
      }
    }

    let res;
    let error;

    try {
      const response = await fetch(url, options);
      res = await response.json();

      if (!response.ok) {
        error = new Error(res?.message || 'Request failed');
        error.name = API_ERROR_REQUEST_FAILED;
      }
    }
    catch (fetchError) {
      error = fetchError;
      error.details = {
        path,
        actionPayload,
      };
    }

    if (!error) {
      if (!res || typeof res !== 'object' || typeof res.result !== 'object') {
        error = new Error(`Invalid response object: ${JSON.stringify(res)}`);
        error.name = API_ERROR_REQUEST_INVALID_RESPONSE;
        error.details = {
          path,
          actionPayload,
        };
      }
      else if (!res.success) {
        const resError = res.result;
        if (resError && resError.message) {
          error = new Error(resError.message);

          for (const errorPropertyName of Object.keys(resError)) {
            error[errorPropertyName] = resError[errorPropertyName];
          }

          error.name = resError.name || API_ERROR_REQUEST_FAILED;
          error.details = {
            ...(resError.details || {}),
            path,
            actionPayload,
          };
        }
        else {
          error = new Error(`API request not successful without error message: ${JSON.stringify(res)}`);
          error.name = API_ERROR_REQUEST_FAILED;
          error.details = {
            path,
            actionPayload,
          };
        }
      }
    }

    // Check if the currently loaded app commit hash differs from the server app commit hash,
    // and reload the page if needed to load the latest release version.
    if (
      commitHash
      && res
      && res.header['x-app-commit-hash']
      && commitHash !== res.header['x-app-commit-hash']
      && process.browser
    ) {
      onCommitHashChange();
    }

    if (error) {
      debug(`Failed ${apiBasePath}/${path}`, {
        error: serializeError(error),
      });
      logger.error(error);
      throw error;
    }

    if (process.browser) {
      debug(`Success ${apiBasePath}/${path}`, res.result);
    }
    else {
      debug(`Success ${apiBasePath}/${path}`);
    }

    return res.result;
  };
}

export default function createApiClient(params = {}) {
  typeCheck('params::NonEmptyObject', params);
  typeCheck('getSessionToken::Maybe Function', params.getSessionToken);
  typeCheck('commitHash::Maybe String', params.commitHash);
  typeCheck('sessionTokenName::NonEmptyString', params.sessionTokenName);
  typeCheck('apiPath::NonEmptyString', params.apiPath);

  const requestOptions = {
    commitHash: params.commitHash,
    getSessionToken: params.getSessionToken,
    apiBasePath: params.apiPath,
    appUrl: params.appUrl,
    sessionTokenName: params.sessionTokenName,
    onCommitHashChange: () => {
      apiClient.commitHashChangedTimestamp = (
        apiClient.commitHashChangedTimestamp || Date.now()
      );
    },
  };

  const apiClient = {
    commitHashChangedTimestamp: null,
    get: makeApiRequestMethod({
      method: 'get',
      ...requestOptions,
    }),
    post: makeApiRequestMethod({
      method: 'post',
      ...requestOptions,
    }),
  };

  return apiClient;
}
