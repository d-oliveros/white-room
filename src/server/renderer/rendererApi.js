import express from 'express';
import bodyParser from 'body-parser';
import { serializeError } from 'serialize-error';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';

import renderReactApp from '#server/renderer/renderReactApp.js';

/**
 * Renderer server.
 *
 * In charge of rendering the client on server-side.
 * It works by listening for POST requests with the following params:
 *
 * @param {Object} state The initial state to render the client with.
 * @param {String} url   The URL to render.
 *
 * Exposes an express app that can be started on its own,
 * letting you scaling serverside rendering service instances.
 *
 * Server-side rendering can get quite CPU-intensive sometimes,
 * affecting the performance of the API server. That's why you should
 * separate the main API server from the Renderer server.
 *
 * To separate the renderer server from the main API server,
 * start two instances of your app, and modify your .env files.
 *
 * To start a Renderer server instance, change your .env to:
 * ENABLE_SERVER = "false"
 * ENABLE_RENDERER = "true"
 *
 * To start an API server instance, change your .env to:
 * ENABLE_SERVER = "true"
 * ENABLE_RENDERER = "false"
 *
 * Remember to change these lines:
 * RENDERER_PORT = "3001" # Port to listen in
 * RENDERER_ENDPOINT = "http://localhost:3001" # Renderer microservice endpoint
 *
 * @see .env.default in project's root
 */
const renderer = express();

renderer.get('/health', (req, res) => res.sendStatus(200));

renderer.use(bodyParser.json({
  limit: '3mb',
}));

/**
 * Renders the client HTML.
 */
// renderer.post('*', (req, res, next) => {
renderer.get('*', (req, res, next) => {
  // const { state, sessionToken } = req.body;
  const { state, sessionToken } = req.query;

  // Simulate a GET request by creating a new request object
  // This is a limitation imposed by react-router 6 - we should refactor as soon as this is cleaned up
  // const simulatedGetReq = {
  //   method: 'GET',
  //   query: { state, sessionToken },
  //   ...req,
  // };

  renderReactApp({ state, req, res, sessionToken })
    .then((result) => {
      typeCheck('result::RendererResult', result);
      res.send(result);
    })
    .catch(next);
});

/**
 * Error Handler.
 */
renderer.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const { url } = req.body;

  logger.silly(`${status} - ${url}`);

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

export default renderer;
