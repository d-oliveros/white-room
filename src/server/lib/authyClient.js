import superagent from 'superagent';
import { resolve as resolveUrl } from 'url';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';

import {
  AUTHY_ERROR_RESPONSE_NOT_OK,
} from '#common/errorCodes.js';

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
  method = method.toLowerCase();

  const url = resolveUrl('https://api.authy.com', path);
  const authyApiKey = AUTHY_APP_TO_API_KEY_MAPPING[appName];

  debug(`Sending ${method} request to: ${url}${body ? ' with ' + JSON.stringify(body, null, 2) : ''}`);

  if (!authyIsEnabled(authyApiKey)) {
    debug('[requestAuthyEndpoint] Authy is not enabled. Aborting.');
    return null;
  }

  let requestChain = superagent[method](url)
    .set('X-Authy-API-Key', `${authyApiKey}`)
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
    if (
      superagentError.response &&
      superagentError.response.body &&
      (
        superagentError.response.body.message === 'Verification code is incorrect'
        || superagentError.response.body.message === 'Phone number not provisioned with any carrier'
        || superagentError.response.body.message === 'Cannot send SMS to landline phone numbers'
      )
    ) {
      return superagentError.response.body;
    }

    const error = new Error(`Authy response not OK: ${superagentError.message}`);
    error.name = AUTHY_ERROR_RESPONSE_NOT_OK;
    error.details = {
      responseStatus: superagentError.status,
      responseBody: superagentError.response && superagentError.response.body || null,
      responseHeaders: superagentError.response && superagentError.response.headers || null,
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
