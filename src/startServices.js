import logger from './logger.js';
import removeEmpty from './util/removeEmpty.js';

import { postgresMigrateToLatestSchema } from './server/db/knex.js';
import { getSitemapGeneratorFromModules } from './server/lib/sitemapController.js';

import startServer, { getMiddlewareFromModules, getServicesFromModules } from './services/startServer.js';
import startRenderer, { getRoutesFromModules, getInitialStateFromModules } from './services/startRenderer.js';
import startCron, { getPeriodicFunctionsFromModules } from './services/startCron.js';
import startUncaughtExceptionHandler from './services/startUncaughtExceptionHandler.js';

// import open from 'open';

/**
 * Main application entry file.
 * Initializes the application services defined in environmental variables.
 */
const startServices = async ({ modules, config = {} } = {}) => {
  logger.info('Starting services.');
  logger.info(`Modules: ${JSON.stringify(removeEmpty(modules), null, 2)}`);

  const {
    enableKnexMigrations = false,
    enableServer = false,
    enableRenderer = false,
    enableCron = false,
    // enableQueue = false,
    port = '3000',
    rendererPort = '3001',
    useHelmet = true,
    commitHash = null,
    rendererEndpoint = null,
  } = config;

  // THROW ERROR check modules are provided
  // const knex = (await import(`${moduleSourceDirectory}/server/db/knex.js`));
  startUncaughtExceptionHandler();

  const promises = [];

  // Run the latest Knex migrations on startup
  if (enableKnexMigrations) {
    if (!postgresMigrateToLatestSchema) {
      // THROW ERROR about postgresMigrateToLatestSchema not provided!
    }
    promises.push(postgresMigrateToLatestSchema({ modules }));
  }

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
      },
    }));
  }

  // Start the renderer service
  if (enableRenderer) {
    const routes = getRoutesFromModules(modules);
    const middleware = getMiddlewareFromModules(modules);
    const initialState = getInitialStateFromModules(modules);

    console.log('MIDDLEWARE IS', middleware);

    promises.push(startRenderer({
      routes,
      initialState,
      middleware,
      port: rendererPort,
    }));
  }

  // Starts the cron service
  if (enableCron) {
    const periodicFunctions = getPeriodicFunctionsFromModules(modules);

    promises.push(startCron({
      periodicFunctions,
    }));
  }

  if (promises.length === 0) {
    throw new Error('No services enabled.');
  }

  // TODO: Start Queue!

  const results = await Promise.allSettled(promises);

  const errors = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);

  if (errors.length > 0) {
    throw new AggregateError(errors, 'One or more services failed to start');
  }

  // Uncomment to open the application in a browser in development
  // if (NODE_ENV === 'development' && ENABLE_SERVER === 'true') {
  //   open(`http://localhost:${APP_PORT}`);
  // }
};

export default startServices;
