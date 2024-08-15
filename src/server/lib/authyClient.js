import { resolve as resolveUrl } from 'url';

import logger from '#whiteroom/logger.js';
import typeCheck from '#whiteroom/util/typeCheck.js';

import {
  AUTHY_ERROR_RESPONSE_NOT_OK,
} from '#whiteroom/constants/errorCodes.js';

const debug = logger.createDebug('authy');

const COUNTRY_CODE = 1;

const {
  NODE_ENV,
  CIRCLECI,
  FRONT_OVERRIDE_PHONE,
  AUTHY_API_KEY,
} = process.env;

export const authyIsEnabled = (authyApiKey) => {
  return (
    !!authyApiKey
    && NODE_ENV !== 'test'
    && !CIRCLECI
  );
};

export const AUTHY_APP = 'whiteroom';

const AUTHY_APP_TO_API_KEY_MAPPING = {
  [AUTHY_APP]: AUTHY_API_KEY,
};

/**
 * Requests a Authy endpoint.
 *
 * @param  {string} options.method HTTP method to use.
 * @param  {string} options.path   Path to request.
 * @param  {Object} options.body   Request body.
 * @return {Object}
 */
async function requestAuthyEndpoint({ method, path, body, appName }) {
  typeCheck('path::NonEmptyString', path);
  typeCheck('method::NonEmptyString', method);
  typeCheck('body::Maybe Object', body);
  typeCheck('appName::NonEmptyString', appName);

  path = path.indexOf('/') === 0 ? path.substr(1) : path;
  method = method.toUpperCase();

  const url = resolveUrl('https://api.authy.com', path);
  const authyApiKey = AUTHY_APP_TO_API_KEY_MAPPING[appName];

  debug(`Sending ${method} request to: ${url}${body ? ' with ' + JSON.stringify(body, null, 2) : ''}`);

  if (!authyIsEnabled(authyApiKey)) {
    debug('[requestAuthyEndpoint] Authy is not enabled. Aborting.');
    return null;
  }

  const headers = {
    'X-Authy-API-Key': `${authyApiKey}`,
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

      if (
        errorBody.message === 'Verification code is incorrect' ||
        errorBody.message === 'Phone number not provisioned with any carrier' ||
        errorBody.message === 'Cannot send SMS to landline phone numbers'
      ) {
        return errorBody;
      }

      const error = new Error(`Authy response not OK: ${response.statusText}`);
      error.name = AUTHY_ERROR_RESPONSE_NOT_OK;
      error.details = {
        responseStatus: response.status,
        responseBody: errorBody,
        responseHeaders: [...response.headers.entries()]
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      };

      throw error;
    }

    result = await response.json();
  } catch (fetchError) {
    const error = new Error(`Authy request failed: ${fetchError.message}`);
    error.name = AUTHY_ERROR_RESPONSE_NOT_OK;
    error.details = {
      message: fetchError.message,
      stack: fetchError.stack
    };

    throw error;
  }

  return result;
}

/**
 * Sends a verification code number.
 *
 * @param  {Object} params
 * @param  {string} params.phone
 *
 * @return {Promise<Object>} Authy's API response.
 */
export async function sendVerificationCode(params) {
  try {
    typeCheck('params::NonEmptyObject', params);

    const { phone, appName } = params;
    typeCheck('phone::Phone', phone);
    typeCheck('appName::NonEmptyString', appName);

    const result = await requestAuthyEndpoint({
      method: 'post',
      path: '/protected/json/phones/verification/start',
      body: {
        phone_number: FRONT_OVERRIDE_PHONE || phone,
        country_code: COUNTRY_CODE,
        via: 'sms',
      },
      appName,
    });

    debug('[sendVerificationCode] response', result);

    return result;
  }
  catch (superAgentError) {
    logger.error(superAgentError);
  }
}

/**
 * Check a verification code.
 *
 * @param  {Object} params
 * @param  {string} params.phone
 * @param  {string} params.code
 *
 * @return {Promise<Object>} Authy's API response.
 */
export async function checkVerificationCode(params) {
  try {
    typeCheck('params::NonEmptyObject', params);

    const { phone, code, appName } = params;
    typeCheck('phone::Phone', phone);
    typeCheck('code::NonEmptyString', code);
    typeCheck('appName::NonEmptyString', appName);

    const querySearch = new URLSearchParams({
      phone_number: phone,
      country_code: COUNTRY_CODE,
      verification_code: code,
    });

    const result = await requestAuthyEndpoint({
      method: 'get',
      path: `/protected/json/phones/verification/check?${querySearch}`,
      appName,
    });

    debug('[checkVerificationCode] response', result);

    return result;
  }
  catch (superAgentError) {
    logger.error(superAgentError);
  }
}
