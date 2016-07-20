import express from 'express';
import bodyParser from 'body-parser';
import errio from 'errio';
import renderClient from './renderClient';

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
 * ENABLE_API = "false"
 * ENABLE_RENDERER = "true"
 *
 * To start an API server instance, change your .env to:
 * ENABLE_API = "true"
 * ENABLE_RENDERER = "false"
 *
 * Remember to change these lines:
 * RENDERER_PORT = "3001" # Port to listen in
 * RENDERER_ENDPOINT = "http://localhost:3001" # Renderer microservice endpoint
 *
 * @see .env.default in project's root
 */
const renderer = express();

renderer.use(bodyParser.json());

/**
 * Renders the client HTML using the POST'ed state and URL
 */
renderer.post('/', (req, res, next) => {
  const { state, url } = req.body;

  renderClient({ state, url })
    .then(::res.send)
    .catch(next);
});

/**
 * Error Handler
 */
renderer.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const { url } = req.body;

  __log.silly(`${status} - ${url}`);

  if (status >= 500 || status === 400) {
    __log.error(err);
  }

  res.status(status).send(errio.stringify(err));
});

export default renderer;
