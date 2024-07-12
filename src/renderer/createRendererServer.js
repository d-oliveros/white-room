import express from 'express';
import { serializeError } from 'serialize-error';
import cookieParser from 'cookie-parser';

import * as cookiesConfig from '#white-room/config/cookies.js';

import logger from '#white-room/logger.js';
import typeCheck from '#white-room/util/typeCheck.js';

import unwrapSessionToken from '#white-room/server/middleware/unwrapSessionToken.js';
import makeClientInitialState from '#white-room/renderer/makeClientInitialState.js';
import renderReactApp from '#white-room/renderer/renderReactApp.js';

/**
 * Renderer server.
 *
 * This server is responsible for server-side rendering (SSR) of the client application.
 * It listens for GET requests and returns the rendered HTML or JSON, based on the request's `Accept` header.
 *
 * The server works by:
 * 1. Extracting the initial state and session token using middleware.
 * 2. Rendering the React app with the provided state and session token.
 * 3. Returning the rendered HTML or JSON response.
 *
 * This service should be separate from the main API server due to the CPU-intensive nature of SSR.
 * To achieve this separation, you can run two instances of your app with different environment configurations.
 *
 * To start a Renderer server instance, set your .env file to:
 * ENABLE_SERVER = "false"
 * ENABLE_RENDERER = "true"
 *
 * To start an API server instance, set your .env file to:
 * ENABLE_SERVER = "true"
 * ENABLE_RENDERER = "false"
 *
 * Additionally, configure the following in your .env file:
 * RENDERER_PORT = "3001"  # Port to listen on
 * RENDERER_ENDPOINT = "http://localhost:3001"  # Renderer service endpoint
 *
 * @see .env.default in the project's root for reference
 */
const createRendererServer = ({ routes, initialState, middleware, config = {} } = {}) => {
  typeCheck('initialState::Maybe Object', initialState);

  const renderer = express();

  renderer.get('/health', (req, res) => res.sendStatus(200));

  if (!config.cookieSecret) {
    const error = new Error('No config.cookieSecret provided.');
    logger.warn(error.stack);
  }

  renderer.use(
    cookieParser(config.cookieSecret || 'secret', cookiesConfig.session),
    unwrapSessionToken,
    makeClientInitialState({ initialState }),
  );

  // Attach custom middleware.
  if (typeof middleware === 'function') {
    middleware(renderer);
  }

  renderer.get('*', async (req, res, next) => {
    try {
      const state = res.locals.initialState;
      const sessionToken = res.locals.sessionToken;

      console.log('INITAL STATE IS', state);

      const result = await renderReactApp({ req, res, state, sessionToken, routes });

      typeCheck('result::NonEmptyObject', result, {
        errorMessage: 'Invalid result returned by the react app render function.',
      });
      typeCheck('status::PositiveNumber', result.status, {
        errorMessage: 'No HTML status code returned by the react app renderer function.',
      });

      res.status(result.status)

      if (result.status >= 500 && result.error) {
        next(result.error);
        return;
      }

      if (result.redirectUrl) {
        res.redirect(result.redirectUrl);
        return;
      }

      typeCheck('html::NonEmptyString', result.html, {
        errorMessage: 'No HTML returned by the react app renderer function.',
      });

      res.send(result.html);
    }
    catch (error) {
      next(error);
    }
  });

  /**
   * Error Handler.
   */
  renderer.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    logger.silly(`${status} - ${req.url}`);

    if (status >= 500 || status === 400) {
      logger.error(err);
    }

    if (!res.headersSent) {
      res.status(status).send(serializeError(err));
    }
    else {
      next(err);
    }
  });

  return renderer;
}

export default createRendererServer;
