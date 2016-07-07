import express from 'express';
import bodyParser from 'body-parser';
import serializeError from 'serialize-error';
import renderClient from './renderClient';

/**
 * Express app that renders and serves the client on server-side
 * with the provided inital state
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

  if (status >= 500 || status === 400) {
    __log.warn(`Got ${status} - ${url}`);
    __log.error(err);
  } else {
    __log.silly(`${status} ${url}`);
  }

  res.status(status).send(serializeError(err));
});

export default renderer;
