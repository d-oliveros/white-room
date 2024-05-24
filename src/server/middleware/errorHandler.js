import { serializeError } from 'serialize-error';

const {
  NODE_ENV,
} = process.env;

/**
 * Express error handler
 */
export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;

  const shouldLogError = status >= 500;

  // Internal Errors
  if (shouldLogError) {
    __log.error(err);
  }

  if (res.headersSent) {
    next(res);
    return;
  }

  if (NODE_ENV === 'production') {
    return res.sendStatus(status);
  }

  switch (status) {
    case 404:
      res.sendStatus(status);
      break;

    default: {
      const serialized = serializeError(err);

      // returns a JSON object if request is AJAX,
      // returns a mini HTML page with error info if requesting the client
      const responseBody = serialized.response && serialized.response.body || '<no response body>';
      const errData = !res.locals.initialState ? serialized : `
        <html>
          <head>
            <title>${status} error</title>
          </head>
          <body>
            <pre>${err.stack.replace('\n', '<br>')}</pre>
            <h4>Serialized error: body</h4>
            <pre>${JSON.stringify(responseBody, null, 2)}</pre>
            <h4>Serialized error: full</h4>
            <pre>${JSON.stringify(serialized, null, 2)}</pre>
          </body>
        </html>`;

      res.status(status).send(errData);
    }
  }
}
