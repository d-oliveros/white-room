import assert from 'assert';
import { Router } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import unwrapSessionToken from '#white-room/server/middleware/unwrapSessionToken.js';

import { v4 as uuidv4 } from 'uuid';
import { serializeError } from 'serialize-error';
import lodashKeyBy from 'lodash/fp/keyBy.js';

import * as cookiesConfig from '#white-room/config/cookies.js';

import logger from '#white-room/logger.js';
import typeCheck from '#white-room/util/typeCheck.js';
import trimStringValues from '#white-room/util/trimStringValues.js';

const debug = logger.createDebug('api');

function rejectApiRequest({ res, error, path }) {
  const serializedError = serializeError(error);
  debug(`Error "${path}"`, serializedError);
  res.send({
    success: false,
    result: serializedError,
  });
}

function authenticateRequest(servicesByPath, options) {
  typeCheck('servicesByPath::NonEmptyObject', servicesByPath);

  return function authenticateRequestMiddleware(req, res, next) {
    const session = res.locals && res.locals[options?.sessionName || 'session'] || null;
    const path = req.params.path;
    const service = servicesByPath[path];

    // 404
    let serviceMethod = 'POST';
    if (service && typeof service.method === 'string') {
      serviceMethod = service.method.toUpperCase();
    }

    if (!service || serviceMethod !== req.method) {
      const error = new Error(`Action "${path}" not found.`);
      error.name = 'NotFound';
      error.details = {
        path: path,
        userSession: session,
      };
      res.status(404);
      rejectApiRequest({ res, error, path });
      return;
    }

    // API_ERROR_NOT_ALLOWED
    if (Array.isArray(service.roles)) {
      if (service.roles.length > 0 && !session) {
        const error = new Error('User is not logged in.');
        error.name = 'NotAllowed';
        error.source = 'Web';
        error.details = {
          path: path,
          userSession: session,
        };
        rejectApiRequest({ res, error, path });
        return;
      }

      const allowedRoles = [
        ...(options?.adminRoles || []),
        ...service.roles,
      ];
      if (!session.roles.some((sessionRole) => allowedRoles.includes(sessionRole))) {
        const error = new Error(
          `Request session roles are not allowed to perform "${service.type}": ` +
          session.roles
        );
        error.name = 'NotAllowed';
        error.details = {
          path: path,
          userSession: session,
        };
        rejectApiRequest({ res, error, path });
        return;
      }
    }

    next();
  };
}

function validateActionPayload(servicesByPath) {
  typeCheck('servicesByPath::Object', servicesByPath);
  return function validateActionPayloadMiddleware(req, res, next) {
    const session = res.locals && res.locals.session || null;
    const path = req.params.path;
    const actionPayload = (req.method === 'GET'
      ? req.query
      : req.body
    );

    const service = servicesByPath[path];
    if (!service || typeof service.validate !== 'function') {
      next();
    }
    else {
      Promise.resolve()
        .then(() => service.validate(actionPayload))
        .then(() => next())
        .catch((payloadValidationError) => {
          const error = new Error(`Payload validation failed: ${payloadValidationError.message}`, {
            cause: payloadValidationError,
          });
          error.name = 'PayloadValidationFailed';
          error.details = {
            path: path,
            actionPayload: actionPayload,
            userSession: session,
          };
          rejectApiRequest({ res, error, path });
        });
    }
  };
}

function handleActionRequest(servicesByPath) {
  typeCheck('servicesByPath::Object', servicesByPath);
  return async function handleActionRequestController(req, res) {
    const session = res.locals && res.locals.session || null;
    const path = req.params.path;
    const actionPayload = trimStringValues(req.method === 'GET'
      ? req.query
      : req.body
    ) || {};
    const contentType = req.method === 'GET'
      ? req.query.contentType || 'application/json'
      : req.headers.contentType;

    try {
      const service = servicesByPath[path];
      let sendFilePath;
      debug(`Calling "${path}"`, actionPayload);
      const result = await service.handler({
        session: session,
        payload: actionPayload,
        requestIp: req.ip,
        sendFile: (filePath) => {
          sendFilePath = filePath;
        },
        setCookie: (cookieName, cookieVal, cookieOptions) => {
          if (!cookieVal) {
            debug(`setCookie in API action "${path}", res.clearCookie("${cookieName}")`);
            res.clearCookie(cookieName, cookieOptions);
          }
          else {
            debug(`setCookie in API action "${path}", res.cookie("${cookieName}",`, cookieVal, ')');
            res.cookie(cookieName, cookieVal, cookieOptions);
          }
        },
        getCookie: (cookieName) => {
          typeCheck('cookieName::NonEmptyString', cookieName);
          return req.cookies[cookieName];
        },
      });

      debug(`Success "${path}"`);

      if (sendFilePath) {
        debug(`Sending file ${sendFilePath}`);
        res.sendFile(sendFilePath);
      }
      else if (contentType === 'text/csv') {
        if (typeof service.toCsv !== 'function') {
          res.sendStatus(415);
          return;
        }

        const { fileName, data } = await service.toCsv({
          payload: actionPayload,
          data: result,
        });
        typeCheck('servicesByPath::NonEmptyString', fileName);
        typeCheck('servicesByPath::String', data);

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
        path: path,
        actionPayload: actionPayload,
        userSession: session,
        shortId: errorShortId,
      };

      logger.error(error);
      rejectApiRequest({ res, error, path });
    }
  };
}

export default function createApiServer(services, options = {}) {
  typeCheck('services::NonEmptyArray', services);

  for (const service of services) {
    typeCheck('service::Service', service, {
      errorMessage: `Service is not valid: ${JSON.stringify(service, null, 2)}`,
    });
  }

  const servicesByPath = lodashKeyBy('path', services);

  // Make sure there's no repeated services
  assert(
    services.length === Object.keys(servicesByPath).length,
    `Duplicate services: ${JSON.stringify(services)}`
  );

  const router = new Router();

  router.use(
    bodyParser.json(),
    cookieParser(options.cookieSecret, cookiesConfig.session),
    unwrapSessionToken,
  );

  router.all('/:path',
    authenticateRequest(servicesByPath, options),
    validateActionPayload(servicesByPath),
    handleActionRequest(servicesByPath),
  );

  return router;
}

