import superagent from 'superagent';
import { resolve as resolveUrl } from 'url';
import { serializeError } from 'serialize-error';
import typeCheck from 'common/util/typeCheck';

import {
  FIREBASE_CLOUD_MESSAGING_ERROR_RESPONSE_NOT_OK,
} from 'common/errorCodes';
import {
  PUSH_NOTIFICATION_SOUND_DEFAULT,
} from 'common/pushNotificationConstants';

const debug = __log.debug('fcm');

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
  method = method.toLowerCase();

  const url = resolveUrl('https://fcm.googleapis.com/fcm/', path);

  debug(`Sending ${method} request to: ${url}${body ? ' with ' + JSON.stringify(body, null, 2) : ''}`);

  if (!FIREBASE_API_KEY) {
    debug('[requestFCMEndpoint] Firebase Cloud Messaging is not enabled. Aborting.');
    return null;
  }

  let requestChain = superagent[method](url)
    .set('Authorization', `key=${FIREBASE_API_KEY}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  if (body) {
    requestChain = requestChain.send(body);
  }

  let result;

  try {
    const response = await requestChain;
    result = response.body;
  }
  catch (superagentError) {
    const error = new Error(`Firebase Cloud Messaging response not OK: ${superagentError.message}`);
    error.name = FIREBASE_CLOUD_MESSAGING_ERROR_RESPONSE_NOT_OK;
    error.details = {
      responseStatus: superagentError.status,
      responseBody: superagentError.response && superagentError.response.body || null,
      responseHeaders: superagentError.response && superagentError.response.headers || null,
    };
    error.inner = serializeError(superagentError);
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
        notification: {
          sound: PUSH_NOTIFICATION_SOUND_DEFAULT,
          ...notification,
        },
        data: data,
      },
    });

    debug('[sendNotification] response', result);

    return result;
  }
  catch (superAgentError) {
    __log.error(superAgentError);
  }
}
