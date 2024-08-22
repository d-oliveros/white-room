import logger from '../logger.js';

import { getSitemapGeneratorFromModules } from '../server/lib/sitemapController.js';

import startServer, { getMiddlewareFromModules, getServicesFromModules } from './startServer.js';
import startRenderer, { getInitialStateFromModules } from './startRenderer.js';
import startCron, { getPeriodicFunctionsFromModules } from './startCron.js';
import startQueue, { getQueueHandlersFromModules } from './startQueue.js';
// import startUncaughtExceptionHandler from './startUncaughtExceptionHandler.js';

// import open from 'open';

/**
 * Starts the services required by the project's modules.
 */
const run = async ({ modules, config = {} } = {}) => {
  logger.info('Starting services.');
  // logger.info(`Modules: ${JSON.stringify(removeEmpty(modules), null, 2)}`);

  const {
    enableServer = false,
    enableRenderer = false,
    enableCron = false,
    enableQueue = false,
    queueId = 'queue',
    port = '3000',
    rendererPort = '3001',
    useHelmet = true,
    commitHash = null,
    rendererEndpoint = null,
    cookieSecret = 'secret',
    segmentLibProxyUrl = null,
  } = config;

  const result = {
    server: null,
  };

  const promises = [];

  // Start the API server
  if (enableServer) {
    const services = getServicesFromModules(modules);
    const sitemapGenerator = getSitemapGeneratorFromModules(modules)

    promises.push(startServer({
      port,
      services,
      sitemapGenerator,
      config: {
        useHelmet,
        commitHash,
        rendererEndpoint,
        segmentLibProxyUrl,
      },
    }).then((server) => {
      result.server = server;
      return server;
    }));
  }

  // Start the renderer service
  if (enableRenderer) {
    if (!Array.isArray(modules.routes) || modules.routes.length === 0) {
      throw new Error('Can not start the renderer without routes.');
    }
    const middleware = getMiddlewareFromModules(modules);
    const initialState = getInitialStateFromModules(modules);

    promises.push(startRenderer({
      port: rendererPort,
      routes: modules.routes,
      initialState,
      middleware,
      config: {
        cookieSecret,
      },
    }).then((renderer) => {
      result.renderer = renderer;
      return renderer;
    }));
  }

  // Starts the cron service
  if (enableCron) {
    const periodicFunctions = getPeriodicFunctionsFromModules(modules);

    promises.push(startCron({
      periodicFunctions,
    }));
  }

  if (enableQueue) {
    const queueHandlers = getQueueHandlersFromModules(modules);

    promises.push(startQueue({ queueId, queueHandlers }));
  }

  if (promises.length === 0) {
    throw new Error('No services enabled.');
  }

  // TODO: Start Queue!

  const results = await Promise.allSettled(promises);

  const errors = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);

  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, 'Some services failed to start.');
  }

  // Uncomment to open the application in a browser in development
  // if (NODE_ENV === 'development' && ENABLE_SERVER === 'true') {
  //   open(`http://localhost:${APP_PORT}`);
  // }
};

export default run;
