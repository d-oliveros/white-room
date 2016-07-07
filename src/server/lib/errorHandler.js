import serializeError from 'serialize-error';

const isProduction = __config.env === 'production';

/**
 * Express error handler
 */
export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;

  // Internal Errors
  if (status >= 500) {
    __log.error(err);
  }

  // Redirection
  if (status === 301 || status === 302) {
    return res.status(status).redirect(err.redirection || '/');
  }

  if (isProduction) {
    return res.sendStatus(status);
  }

  const serialized = serializeError(err);

  const errData = !req.isInitial ? serialized : `
    <html>
      <head>
        <title>${status} error</title>
      </head>
      <body>
        <pre>${err.stack.replace('\n', '<br>')}</pre>
        <h4>Stringified error:</h4>
        <pre>${JSON.stringify(serialized, null, 2)}</pre>
      </body>
    </html>`;

  res.status(status).send(errData);
}
