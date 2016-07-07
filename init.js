
// Registers babel
require('babel-register');

// Loads the default environmental variables
require('./util/loadenv');

/**
 * Define global variables.
 */
global.__config = require('./config');
global.__log = require('./src/server/lib/logger').default;

/**
 * Starts the API server
 */
if (__config.interfaces.API) {
  const app = require('./src/server/app').default;
  const apiPort = __config.server.port;

  app.bootstrap(apiPort, () => {
    console.log(`App listening on port: ${apiPort}`);
  });
}

/**
 * Starts the Renderer microservice
 */
if (__config.interfaces.RENDERER) {
  const renderer = require('./src/server/modules/renderer').default;
  const rendererPort = process.env.RENDERER_PORT;

  renderer.listen(rendererPort, () => {
    console.log(`Renderer listening on port: ${rendererPort}`);
  });
}

/**
 * Uncaught exception handler.
 *
 * The application will log uncaught exceptions. If 10 exceptions happen
 * in a 3 minute interval, the application will stop.
 *
 * Make sure you have a daemon restaring your instance when it crashes. eg. pm2
 */
var errCount = 0;
process.on('uncaughtException', (exception) => {
  __log.error(exception);

  errCount++;
  if (errCount === 10) {
    process.exit(1);
  }
});

setInterval(() => { errCount = 0; }, 180000);
