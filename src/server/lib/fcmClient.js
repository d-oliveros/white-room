import { resolve as resolveUrl } from 'url';

import logger from '#whiteroom/logger.js';
import typeCheck from '#whiteroom/util/typeCheck.js';

import {
  FIREBASE_CLOUD_MESSAGING_ERROR_RESPONSE_NOT_OK,
} from '#whiteroom/constants/errorCodes.js';

const debug = logger.createDebug('fcm');

const {
  FIREBASE_API_KEY,
  NODE_ENV,
} = process.env;

export const firebaseIsEnabled = NODE_ENV !== 'test';

/**
 * Requests a Firebase Cloud Messaging endpoint.
 *
 * @param  {string} options.method HTTP method to use.
 * @param  {string} options.path   Path to request.
 * @param  {Object} options.body   Request body.
 * @return {Object}                Firebase Cloud Messaging response.
 */
async function requestFCMEndpoint({ method, path, body }) {
  typeCheck('path::NonEmptyString', path);
  typeCheck('method::NonEmptyString', method);

  path = path.indexOf('/') === 0 ? path.substr(1) : path;
  method = method.toUpperCase();

  const url = resolveUrl('https://fcm.googleapis.com/fcm/', path);

  debug(`Sending ${method} request to: ${url}${body ? ' with ' + JSON.stringify(body, null, 2) : ''}`);

  if (!FIREBASE_API_KEY) {
    debug('[requestFCMEndpoint] Firebase Cloud Messaging is not enabled. Aborting.');
    return null;
  }

  const headers = {
    'Authorization': `key=${FIREBASE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let result;

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.json();
      const error = new Error(`Firebase Cloud Messaging response not OK: ${response.statusText}`);
      error.name = FIREBASE_CLOUD_MESSAGING_ERROR_RESPONSE_NOT_OK;
      error.details = {
        responseStatus: response.status,
        responseBody: errorBody,
        responseHeaders: [...response.headers.entries()]
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      };
      throw error;
    }

    result = await response.json();
  } catch (fetchError) {
    const error = new Error(`Firebase Cloud Messaging request failed: ${fetchError.message}`);
    error.name = FIREBASE_CLOUD_MESSAGING_ERROR_RESPONSE_NOT_OK;
    error.details = {
      message: fetchError.message,
      stack: fetchError.stack
    };
    throw error;
  }

  return result;
}


/**
 * Sends a push notification.
 *
 * @param  {Object} params
 * @param  {string} params.deviceRegistrationIds
 * @param  {Object} params.notification
 *
 * @return {undefined}
 */
export async function sendNotification(params) {
  try {
    typeCheck('params::NonEmptyObject', params);

    const { deviceRegistrationIds, notification, data } = params;
    typeCheck('deviceRegistrationIds::NonEmptyArray', deviceRegistrationIds);
    typeCheck('notification::NonEmptyObject', notification);
    typeCheck('data::Maybe Object', data);

    const result = await requestFCMEndpoint({
      method: 'post',
      path: '/send',
      body: {
        registration_ids: deviceRegistrationIds,
        notification,
        data: data,
      },
    });

    debug('[sendNotification] response', result);

    return result;
  }
  catch (superAgentError) {
    logger.error(superAgentError);
  }
}
