
// Registers babel
require('babel-register');

// Loads the default environmental variables
require('./util/loadenv');

/**
 * Define global variables.
 */
global.__config = require('./config');
global.__log = require('./src/server/lib/logger').default;

var env = process.env;

/**
 * Starts the API server
 */
if (env.ENABLE_API === 'true') {
  const app = require('./src/server/app').default;
  const appPort = __config.server.port;

  app.bootstrap(appPort, (err) => {
    if (err) return console.error(err);
    console.log(`App listening on port: ${appPort}`);
  });
}

/**
 * Starts the Renderer microservice
 */
if (env.ENABLE_RENDERER === 'true') {
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
