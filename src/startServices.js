import knex, { postgresMigrateToLatestSchema } from './server/db/knex.js';
import startServer, { getServices } from './services/startServer.js';
import startRenderer, { getRoutesFromModules, getAppStateFromModules } from './services/startRenderer.js';
import startCron, { getPeriodicFunctionsFromModules } from './services/startCron.js';
import startUncaughtExceptionHandler from './services/startUncaughtExceptionHandler.js';

// import open from 'open';

/**
 * Main application entry file.
 * Initializes the application services defined in environmental variables.
 */
const startServices = async ({ modules, config = {} } = {}) => {
  // THROW ERROR check modules are provided
  // const knex = (await import(`${moduleSourceDirectory}/server/db/knex.js`));
  startUncaughtExceptionHandler();

  const promises = [];

  // Run the latest Knex migrations on startup
  if (config.enableKnexMigrations) {
    if (!knex) {
      // THROW ERROR about knex not provided!
    }
    promises.push(postgresMigrateToLatestSchema({ modules }));
  }

  // Start the API server
  if (config.enableServer) {
    const services = getServices(modules);
    console.log(services);

    promises.push(startServer({
      services,
    }));
  }

  // Start the renderer service
  if (config.enableRenderer) {
    const routes = getRoutesFromModules(modules);
    const getAppState = () => getAppStateFromModules(modules);

    promises.push(startRenderer({
      routes,
      getAppState,
      port: config.rendererPort,
    }));
  }

  // Starts the cron service
  if (config.enableCron) {
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
