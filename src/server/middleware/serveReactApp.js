import assert from 'assert';
import request from 'superagent';

import * as cookiesConfig from '#config/cookies.js';
import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';

import {
  RENDERER_INVALID_RESPONSE_TYPE,
} from '#common/errorCodes.js';

import {
  RENDERER_RESPONSE_TYPE_SUCCESS,
  RENDERER_RESPONSE_TYPE_REDIRECT,
  RENDERER_RESPONSE_TYPE_NOT_FOUND,
  RENDERER_RESPONSE_TYPE_ERROR,
} from '#server/renderer/rendererResponseTypes.js';

const debug = logger.createDebug('renderer:serverReactApp');
const rendererServerEndpoint = process.env.RENDERER_ENDPOINT;

/**
 * Serves the fully rendered react app's HTML by requesting the HTML to the renderer server.
 * The initial client state is generated using data in 'res.locals.initialState', which is populated in renderer steps.
 */
export default function serveReactAppController(req, res, next) {
  const state = res.locals.initialState;
  assert(state, 'res.locals.initialState is required');

  const { url } = req;
  const rendererStartTimestamp = Date.now();

  const sessionToken = req.cookies[cookiesConfig.session.name];

  request
    .get(rendererServerEndpoint)
    .query({ state, url, sessionToken })
    .end((err, rendererRes) => {
      if ((!rendererRes || !rendererRes.text) && !err) {
        err = new Error('No response from the renderer server.');
      }

      if (err) {
        if (typeof err === 'string') {
          err = new Error(err);
        }
        err.isRenderer = true;
        next(err);
        return;
      }

      const result = rendererRes.body;
      typeCheck('result::RendererResult', result);

      const rendererResponseTime = Date.now() - rendererStartTimestamp;

      debug(`Got renderer response in ${rendererResponseTime}ms.`);

      res.set('X-Renderer-Response-Type', result.type);
      res.set('X-Renderer-Response-Time-Ms', rendererResponseTime);

      switch (result.type) {
        case RENDERER_RESPONSE_TYPE_SUCCESS: {
          res.send(result.html);
          break;
        }

        case RENDERER_RESPONSE_TYPE_REDIRECT: {
          res.redirect(302, result.redirectUrl);
          break;
        }

        case RENDERER_RESPONSE_TYPE_NOT_FOUND: {
          if (result.html) {
            res.status(404).send(result.html);
          }
          else {
            res.sendStatus(404);
          }
          break;
        }

        case RENDERER_RESPONSE_TYPE_ERROR: {
          const error = new Error(result.error.message);
          error.name = result.error.name;
          error.stack = result.error.stack;
          error.source = 'Renderer';
          error.reporter = 'server:renderer:serverReactApp';
          if (result.error.inner) {
            error.inner = result.error.inner;
          }
          if (result.error.details) {
            error.details = result.error.details;
          }
          if (result.error.status) {
            error.status = result.error.status;
          }
          if (result.error.statusCodes) {
            error.statusCode = result.error.statusCode;
          }
          next(error);
          break;
        }

        default: {
          const error = new Error(`Invalid renderer response type: ${result.type}.`);
          error.name = RENDERER_INVALID_RESPONSE_TYPE;
          error.details = {
            rendererResult: result,
          };
          next(error);
        }
      }
    });
}
