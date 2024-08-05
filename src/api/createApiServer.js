import assert from 'assert';
import { Router } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import unwrapSessionToken from '#white-room/server/middleware/unwrapSessionToken.js';
import withoutLeadingSlash from '#white-room/util/withoutLeadingSlash.js';

import { v4 as uuidv4 } from 'uuid';
import { serializeError } from 'serialize-error';
import lodashKeyBy from 'lodash/fp/keyBy.js';

import * as cookiesConfig from '#white-room/config/cookies.js';

import logger from '#white-room/logger.js';
import typeCheck from '#white-room/util/typeCheck.js';
import trimStringValues from '#white-room/util/trimStringValues.js';

const debug = logger.createDebug('api');

const anonymousSession = {
  roles: [],
  userId: null,
};

function rejectApiRequest({ res, error }) {
  const serializedError = serializeError(error);
  res.send({
    success: false,
    result: serializedError,
  });
}

function getPathFromReqParams(params) {
  return params && params[0] && typeof params[0] === 'string'
    ? withoutLeadingSlash(params[0])
    : null;
}


function getSessionFromResLocals(locals, sessionName = 'session') {
  return locals && locals[sessionName] || anonymousSession;
}

function authenticateRequest(servicesByPath, options) {
  typeCheck('servicesByPath::NonEmptyObject', servicesByPath);

  return function authenticateRequestMiddleware(req, res, next) {
    const session = getSessionFromResLocals(res, options?.sessionName);
    const path = getPathFromReqParams(req.params);
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
      rejectApiRequest({ res, error });
      return;
    }

    // API_ERROR_NOT_ALLOWED
    if (Array.isArray(service.roles) && service.roles.length > 0) {
      if (!session) {
        const error = new Error('User is not logged in.');
        error.name = 'NotAllowed';
        error.source = 'Web';
        error.details = {
          path: path,
          userSession: session,
        };
        rejectApiRequest({ res, error });
        return;
      }

      const allowedRoles = [
        ...(options?.adminRoles || []),
        ...service.roles,
      ];
      if (!session.roles.some((sessionRole) => allowedRoles.includes(sessionRole))) {
        const error = new Error(
          `Request session roles are not allowed in "${service.path}": ` +
          (session.roles.join(', ') || 'n/a')
        );
        error.name = 'NotAllowed';
        error.details = {
          path: path,
          userSession: session,
        };
        rejectApiRequest({ res, error });
        return;
      }
    }

    next();
  };
}

function validateActionPayload(servicesByPath) {
  typeCheck('servicesByPath::Object', servicesByPath);
  return async function validateActionPayloadMiddleware(req, res, next) {
    let path;
    let actionPayload;
    try {
      path = getPathFromReqParams(req.params);
      actionPayload = (req.method === 'GET'
        ? req.query
        : req.body
      );
      const service = servicesByPath[path];
      if (service?.validate) {
        await service.validate(actionPayload);
      }

      if (service?.schema?.parseAsync) {
        console.log('TODO: Fix service?.schema?.parseAsync not throwing an error.');
        await service.schema.parseAsync(actionPayload);
      }
      next();
    }
    catch (payloadValidationError) {
      const error = new Error(`Payload validation failed: ${payloadValidationError.message}`, {
        cause: payloadValidationError,
      });
      error.name = 'PayloadValidationFailed';
      error.details = {
        path,
        actionPayload,
      };
      rejectApiRequest({ res, error });
    }
  };
}

function handleActionRequest(servicesByPath, options) {
  typeCheck('servicesByPath::Object', servicesByPath);
  return async function handleActionRequestController(req, res) {
    const session = getSessionFromResLocals(res, options?.sessionName);

    const path = getPathFromReqParams(req.params);
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
        session,
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
      rejectApiRequest({ res, error });
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

  router.all('/*',
    authenticateRequest(servicesByPath, options),
    validateActionPayload(servicesByPath),
    handleActionRequest(servicesByPath, options),
  );

  return router;
}

