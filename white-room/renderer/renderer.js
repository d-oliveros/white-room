import express from 'express';
import { serializeError } from 'serialize-error';
import cookieParser from 'cookie-parser';

import * as cookiesConfig from '#config/cookies.js';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';

import unwrapSessionToken from '#server/middleware/unwrapSessionToken.js';
import extractInitialState from '#server/renderer/extractInitialState.js';
import renderReactApp from '#server/renderer/renderReactApp.js';

const {
  COOKIE_SECRET,
} = process.env;

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
export default function createRendererServer({ getAppState } = {}) {
  typeCheck('getAppState::Maybe AsyncFunction|Function', getAppState);

  const renderer = express();

  renderer.get('/health', (req, res) => res.sendStatus(200));

  renderer.use(
    cookieParser(COOKIE_SECRET, cookiesConfig.session),
    unwrapSessionToken,
    extractInitialState({ getAppState }),
  );

  renderer.get('*', async (req, res, next) => {
    try {
      const state = res.locals.initialState;
      const sessionToken = res.locals.sessionToken;

      const result = await renderReactApp({ req, res, state, sessionToken });
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
