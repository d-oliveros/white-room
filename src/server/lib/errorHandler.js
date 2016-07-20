import errio from 'errio';

const isRenderer = __config.interfaces.RENDERER;
const isProduction = __config.env === 'production';

/**
 * Express error handler
 */
export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;

  const shouldLogError = status >= 500 && (!err.isRenderer || !isRenderer);

  // Internal Errors
  if (shouldLogError) {
    __log.error(err);
  }

  if (isProduction) {
    return res.sendStatus(status);
  }

  switch (status) {
    case 301:
    case 302:
      res.status(status).redirect(err.redirection || '/');
      break;

    case 404:
      res.sendStatus(status);
      break;

    default: {
      const serialized = errio.stringify(err);

      // returns a JSON object if request is AJAX,
      // returns a mini HTML page with error info if requesting the client
      const errData = !req.isInitial ? serialized : `
        <html>
          <head>
            <title>${status} error</title>
          </head>
          <body>
            <pre>${err.stack.replace('\n', '<br>')}</pre>
            <h4>Stringified error:</h4>
            <pre>${JSON.stringify(err, null, 2)}</pre>
          </body>
        </html>`;

      res.status(status).send(errData);
    }
  }
}
