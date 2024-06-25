import { serializeError } from 'serialize-error';
import logger from '#common/logger.js';

const {
  NODE_ENV,
} = process.env;

/**
 * Express error handler
 */
export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;

  // Internal Errors
  if (status >= 500) {
    logger.error(err);
  }

  if (res.headersSent) {
    next(res);
    return;
  }

  if (NODE_ENV === 'production' || status === 404) {
    res.sendStatus(status);
    return;
  }

  const serialized = serializeError(err);

  const errData = `
    <html>
      <head>
        <title>${status} error</title>
      </head>
      <body>
        <pre>${err.stack.replace('\n', '<br>')}</pre>
        <h4>Serialized error</h4>
        <pre>${JSON.stringify(serialized, null, 2)}</pre>
      </body>
    </html>`;

  res.status(status).send(errData);
}
