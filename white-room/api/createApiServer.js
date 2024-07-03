import assert from 'assert';
import { Router } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import unwrapSessionToken from '#server/middleware/unwrapSessionToken.js';

import { v4 as uuidv4 } from 'uuid';
import { serializeError } from 'serialize-error';
import lodashKeyBy from 'lodash/fp/keyBy.js';

import * as cookiesConfig from '#config/cookies.js';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import trimStringValues from '#common/util/trimStringValues.js';
import handleUserErrorMessages from '#common/handleUserErrorMessages.js';

import {
  API_ERROR_ACTION_NOT_FOUND,
  API_ERROR_NOT_ALLOWED,
  API_ERROR_ACTION_PAYLOAD_VALIDATION_FAILED,
} from '#common/errorCodes.js';

const {
  COOKIE_SECRET,
} = process.env;

const debug = logger.createDebug('api');

/**
 * Checks if the provided `actionSpec` is a valid `actionSpec`.
 *
 * @param  {Object}   actionSpec  API action definition.
 * @return {boolean}  `true` if `actionSpec` is a valid `actionSpec`.
 */
function isValidActionSpec(actionSpec) {
  return !!(
    typeof actionSpec === 'object'
      && actionSpec
      && typeof actionSpec.type === 'string'
      && actionSpec.type
      && typeof actionSpec.handler === 'function'
      && (!actionSpec.queueConcurrency ||  typeof actionSpec.queueConcurrency === 'number')
      && (!actionSpec.validate || typeof actionSpec.validate === 'function')
      && (!actionSpec.method || typeof actionSpec.method === 'string')
  );
}

function rejectApiRequest({ res, error, actionType }) {
  const serializedError = serializeError(error);
  debug(`Error "${actionType}"`, serializedError);
  res.send({
    success: false,
    result: serializedError,
  });
}

function authenticateAction(actionSpecs, options) {
  typeCheck('actionSpescs::NonEmptyObject', actionSpecs);
  return function authenticateActionMiddleware(req, res, next) {
    const session = res.locals && res.locals[options?.sessionName || 'session'] || null;
    const actionType = req.params.actionType;
    const actionSpec = actionSpecs[actionType];

    // 404
    let actionSpecMethod = 'POST';
    if (actionSpec && typeof actionSpec.method === 'string') {
      actionSpecMethod = actionSpec.method.toUpperCase();
    }

    if (!actionSpec || actionSpecMethod !== req.method) {
      const error = new Error(`Action "${actionType}" not found.`);
      error.name = API_ERROR_ACTION_NOT_FOUND;
      error.details = {
        actionType: actionType,
        userSession: session,
      };
      res.status(404);
      rejectApiRequest({ res, error, actionType });
      return;
    }

    // API_ERROR_NOT_ALLOWED
    if (Array.isArray(actionSpec.roles)) {
      if (actionSpec.roles.length > 0 && !session) {
        const error = new Error('User is not logged in.');
        error.name = API_ERROR_NOT_ALLOWED;
        error.source = 'Web';
        error.details = {
          actionType: actionType,
          userSession: session,
        };
        rejectApiRequest({ res, error, actionType });
        return;
      }

      const allowedRoles = [
        ...(options?.adminRoles || []),
        ...actionSpec.roles,
      ];
      if (!session.roles.some((sessionRole) => allowedRoles.includes(sessionRole))) {
        const error = new Error(
          `Request session roles are not allowed to perform "${actionSpec.type}": ` +
          session.roles
        );
        error.name = API_ERROR_NOT_ALLOWED;
        error.details = {
          actionType: actionType,
          userSession: session,
        };
        rejectApiRequest({ res, error, actionType });
        return;
      }
    }

    next();
  };
}

function validateActionPayload(actionSpecs) {
  typeCheck('actionSpecs::Object', actionSpecs);
  return function validateActionPayloadMiddleware(req, res, next) {
    const session = res.locals && res.locals.session || null;
    const actionType = req.params.actionType;
    const actionPayload = (req.method === 'GET'
      ? req.query
      : req.body
    );

    const actionSpec = actionSpecs[actionType];
    if (!actionSpec || typeof actionSpec.validate !== 'function') {
      next();
    }
    else {
      Promise.resolve()
        .then(() => actionSpec.validate(actionPayload))
        .then(() => next())
        .catch((payloadValidationError) => {
          const error = new Error(`Payload validation failed: ${payloadValidationError.message}`);
          error.name = API_ERROR_ACTION_PAYLOAD_VALIDATION_FAILED;
          error.inner = serializeError(payloadValidationError);
          error.details = {
            actionType: actionType,
            actionPayload: actionPayload,
            userSession: session,
          };
          rejectApiRequest({ res, error, actionType });
        });
    }
  };
}

function handleActionRequest(actionSpecs) {
  typeCheck('actionSpecs::Object', actionSpecs);
  return async function handleActionRequestController(req, res) {
    const session = res.locals && res.locals.session || null;
    const actionType = req.params.actionType;
    const actionPayload = trimStringValues(req.method === 'GET'
      ? req.query
      : req.body
    ) || {};
    const contentType = req.method === 'GET'
      ? req.query.contentType || 'application/json'
      : req.headers.contentType;

    try {
      const actionSpec = actionSpecs[actionType];
      let sendFilePath;
      debug(`Calling "${actionType}"`, actionPayload);
      const result = await actionSpec.handler({
        session: session,
        payload: actionPayload,
        requestIp: req.ip,
        sendFile: (filePath) => {
          sendFilePath = filePath;
        },
        setCookie: (cookieName, cookieVal, cookieOptions) => {
          if (!cookieVal) {
            debug(`setCookie in API action "${actionType}", res.clearCookie("${cookieName}")`);
            res.clearCookie(cookieName, cookieOptions);
          }
          else {
            debug(`setCookie in API action "${actionType}", res.cookie("${cookieName}",`, cookieVal, ')');
            res.cookie(cookieName, cookieVal, cookieOptions);
          }
        },
        getCookie: (cookieName) => {
          typeCheck('cookieName::NonEmptyString', cookieName);
          return req.cookies[cookieName];
        },
      });

      debug(`Success "${actionType}"`);

      if (sendFilePath) {
        debug(`Sending file ${sendFilePath}`);
        res.sendFile(sendFilePath);
      }
      else if (contentType === 'text/csv') {
        if (typeof actionSpec.toCsv !== 'function') {
          res.sendStatus(415);
          return;
        }

        const { fileName, data } = await actionSpec.toCsv({
          payload: actionPayload,
          data: result,
        });
        typeCheck('actionSpecs::NonEmptyString', fileName);
        typeCheck('actionSpecs::String', data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(data);
      }
      else {
        res.set('Content-Type', 'application/json');
        res.send({
          success: true,
          result: result,
        });
      }
    }
    catch (error) {
      const errorShortId = uuidv4();
      error.details = {
        ...(error.details || {}),
        actionType: actionType,
        actionPayload: actionPayload,
        userSession: session,
        shortId: errorShortId,
      };

      logger.error(error);
      error.userMessage = handleUserErrorMessages({ error, shortId: errorShortId });
      rejectApiRequest({ res, error, actionType });
    }
  };
}

export default function createApiServer(actionSpecsArray, options = {}) {
  typeCheck('actionSpecsArray::NonEmptyArray', actionSpecsArray);

  for (const actionSpec of actionSpecsArray) {
    if (!isValidActionSpec(actionSpec)) {
      const error = new Error(`Action spec is not valid: ${JSON.stringify(actionSpec, null, 2)}`);
      error.name = 'ApiInvalidActionSpecError';
      error.details = {
        actionSpec,
      };
      throw error;
    }
  }

  const actionSpecs = lodashKeyBy('type', actionSpecsArray);

  // Make sure there's no repeated action specs
  assert(
    actionSpecsArray.length === Object.keys(actionSpecs).length,
    `Duplicate action specs: ${JSON.stringify(actionSpecs)}`
  );

  const router = new Router();

  router.use(
    bodyParser.json(),
    cookieParser(COOKIE_SECRET, cookiesConfig.session),
    unwrapSessionToken,
  );

  router.all('/:actionType',
    authenticateAction(actionSpecs, options),
    validateActionPayload(actionSpecs),
    handleActionRequest(actionSpecs),
  );

  return router;
}
