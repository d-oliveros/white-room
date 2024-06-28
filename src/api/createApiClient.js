import { v4 as uuidv4 } from 'uuid';
import { serializeError } from 'serialize-error';

import typeCheck from '#common/util/typeCheck.js';
import handleUserErrorMessages from '#common/handleUserErrorMessages.js';

import {
  API_ERROR_REQUEST_INVALID_RESPONSE,
  API_ERROR_REQUEST_FAILED,
  API_ERROR_REQUEST_NOT_HANDLED_OK,
} from '#common/errorCodes.js';

import log from '#client/lib/log.js';
import * as actionTypes from '#api/actionTypes.js';

const debug = log.debug('api:client');

const actionTypesList = Object.keys(actionTypes);

export function makeApiRequestUrl({ actionType, actionPayload, apiPath, appUrl }) {
  typeCheck('appUrl::NonEmptyString', appUrl);
  typeCheck('actionType::ValidActionType', actionType, {
    customTypes: {
      ValidActionType: {
        typeOf: 'String',
        validate: (x) => actionTypesList.includes(x),
      },
    },
  });
  typeCheck('actionPayload::Maybe Object', actionPayload);

  const query = actionPayload
    ? `?${new URLSearchParams(actionPayload)}`
    : '';

  return `${appUrl}${apiPath}/${actionType}${query}`;
}

function makeApiRequestMethod({
  method,
  commitHash,
  getSessionToken,
  onCommitHashChange,
  apiPath,
  appUrl,
  sessionTokenName,
}) {
  return async function apiRequest(actionType, actionPayload, actionOptions = {}) {
    typeCheck('actionType::ValidActionType', actionType, {
      customTypes: {
        ValidActionType: {
          typeOf: 'String',
          validate: (x) => actionTypesList.includes(x),
        },
      },
    });
    typeCheck('actionPayload::Maybe Object', actionPayload);
    typeCheck('getSessionToken::Maybe Function', getSessionToken);
    typeCheck('actionOptions::Object', actionOptions);

    debug(`Requesting ${apiPath}/${actionType}`, actionPayload);

    const url = `${appUrl}${apiPath}/${actionType}`;
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
    } else if (method === 'post') {
      options.headers['Content-Type'] = 'application/json';
      if (actionPayload) {
        options.body = JSON.stringify(actionPayload);
      }
    }

    let res;
    let error;
    const errorReferenceKey = uuidv4();

    try {
      const response = await fetch(url, options);
      res = await response.json();

      if (!response.ok) {
        error = new Error(res.message || 'Request failed');
        error.name = API_ERROR_REQUEST_FAILED;
      }
    } catch (fetchError) {
      error = fetchError;
      error.details = {
        errorReferenceKey,
        actionType,
        actionPayload,
      };
    }

    if (!error) {
      if (!res || typeof res !== 'object' || typeof res.body !== 'object') {
        error = new Error(`Invalid response object: ${JSON.stringify(res)}`);
        error.name = API_ERROR_REQUEST_INVALID_RESPONSE;
        error.details = {
          errorReferenceKey,
          actionType,
          actionPayload,
        };
      } else if (!res.success) {
        const resError = res.result;
        if (resError && resError.message) {
          error = new Error(resError.message);

          for (const errorPropertyName of Object.keys(resError)) {
            error[errorPropertyName] = resError[errorPropertyName];
          }

          error.name = resError.name || API_ERROR_REQUEST_FAILED;
          error.details = {
            ...(resError.details || {}),
            errorReferenceKey: resError.details.errorReferenceKey || errorReferenceKey,
            actionType,
            actionPayload,
          };
        } else {
          error = new Error(`API request not successful without error message: ${JSON.stringify(res)}`);
          error.name = API_ERROR_REQUEST_FAILED;
          error.details = {
            errorReferenceKey,
            actionType,
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
      debug(`Failed ${apiPath}/${actionType}`, {
        error: serializeError(error),
      });
      log.error(error);
      error.originalMessage = error.message;
      error.message = handleUserErrorMessages({ error });
      throw error;
    }

    if (process.browser) {
      debug(`Success ${apiPath}/${actionType}`, res.body.result);
    } else {
      debug(`Success ${apiPath}/${actionType}`);
    }

    return res.result;
  };
}

export const initialApiActionState = {
  inProgress: false,
  error: null,
  progressPercent: 0,
};

export default function createApiClient(params = {}) {
  typeCheck('params::NonEmptyObject', params);
  typeCheck('getSessionToken::Maybe Function', params.getSessionToken);
  typeCheck('commitHash::Maybe String', params.commitHash);
  typeCheck('sessionTokenName::NonEmptyString', params.sessionTokenName);
  typeCheck('apiPath::NonEmptyString', params.apiPath);

  const apiClient = {
    commitHashChangedTimestamp: null,
    get: makeApiRequestMethod({
      method: 'get',
      commitHash: params.commitHash,
      getSessionToken: params.getSessionToken,
      apiPath: params.apiPath,
      appUrl: params.appUrl,
      sessionTokenName: params.sessionTokenName,
      onCommitHashChange: () => {
        apiClient.commitHashChangedTimestamp = (
          apiClient.commitHashChangedTimestamp || Date.now()
        );
      },
    }),
    post: makeApiRequestMethod({
      method: 'post',
      commitHash: params.commitHash,
      getSessionToken: params.getSessionToken,
      apiPath: params.apiPath,
      appUrl: params.appUrl,
      sessionTokenName: params.sessionTokenName,
      onCommitHashChange: () => {
        apiClient.commitHashChangedTimestamp = (
          apiClient.commitHashChangedTimestamp || Date.now()
        );
      },
    }),
  };

  apiClient.postWithState = async ({
    action,
    state,
    queryId,
    payload,
    timeout,
    onSuccess,
    onError,
  }) => {
    typeCheck('action::String', action);
    typeCheck('state::Object', state);
    typeCheck('queryId::Maybe String|Number', queryId);
    typeCheck('payload::Maybe Object', payload);
    typeCheck('timeout::Maybe Number', timeout);
    typeCheck('onSuccess::Maybe Function', onSuccess);
    typeCheck('onError::Maybe Function', onError);

    const statePath = ['apiState', action, queryId || 'default'];

    if (!state.exists(statePath)) {
      state.set(statePath, initialApiActionState);
    }

    const apiRequestState = state.select(statePath);

    if (apiRequestState.get('inProgress')) {
      debug(`[${action}${queryId ? ':' + queryId : ''}] In progress, aborting.`);
      return;
    }

    apiRequestState.set(['inProgress'], true);
    apiRequestState.set(['error'], null);
    // Hack for slow connections.
    apiRequestState.set(['progressPercent'], 10);
    state.commit();

    const onProgressFn = (e) => {
      // The request start with 100 % instead of 0 %.
      if (e.percent < 100 && e.percent > 10) {
        apiRequestState.set(['progressPercent'], e.percent);
        state.commit();
      }
    };

    let result = null;
    try {
      result = await apiClient.post(action, payload, { onProgressFn, timeout });
      apiRequestState.set(['inProgress'], false);
      apiRequestState.set(['error'], null);
      apiRequestState.set(['progressPercent'], 100);
      if (onSuccess) {
        const optPromise = onSuccess(result);
        if (
          optPromise
          && typeof optPromise === 'object'
          && typeof optPromise.then === 'function'
        ) {
          await optPromise;
        }
      }
    } catch (apiClientError) {
      const errorShortId = apiClientError.details?.shortId || uuidv4();
      const error = new Error(`[API:${action}] ${apiClientError.message}`);
      error.name = apiClientError.name || API_ERROR_REQUEST_NOT_HANDLED_OK;
      error.inner = serializeError(apiClientError);
      error.details = {
        action,
        queryId,
        payload,
        shortId: errorShortId,
      };
      log.error(error);
      apiClientError.originalMessage = apiClientError.message;
      apiClientError.message = handleUserErrorMessages({ error: apiClientError, shortId: errorShortId });
      apiRequestState.set(['inProgress'], false);
      apiRequestState.set(['error'], apiClientError);
      apiRequestState.set(['progressPercent'], 100);
      if (onError) {
        onError(apiClientError);
      }
    }

    state.commit();
    return result;
  };

  return apiClient;
}
