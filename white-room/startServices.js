import { promisify } from 'util';

// import open from 'open';

const {
  APP_PORT,
  USE_BUILD,
  RENDERER_PORT,
  RENDERER_ENDPOINT,
  CRON_WHITELIST,
  COMMIT_HASH,
  NODE_ENV
} = process.env;

const moduleSourceDirectory = USE_BUILD === 'true' ? '../lib' : '../src';

/**
 * Starts the API server.
 * Loads necessary modules and begins listening on the configured port.
 */
const startServer = async () => {
  const logger = (await import(`${moduleSourceDirectory}/common/logger.js`)).default;
  logger.info('Starting server.');

  const [{ createServer }, { actionSpecsList }] = await Promise.all([
    import(`${moduleSourceDirectory}/server/server.js`),
    import(`${moduleSourceDirectory}/api/index.js`)
  ]);

  const server = createServer({
    config: {
      useHelmet:  NODE_ENV !== 'development',
      commitHash: COMMIT_HASH,
      rendererEndpoint: RENDERER_ENDPOINT,
      actionSpecsList: actionSpecsList,
      setHeaders: ({ res }) => res.header('X-W00t', 'woot'),
    },
  });
  const listen = promisify(server.listen).bind(server);
  await listen(APP_PORT);

  logger.info(`Server listening on port: ${APP_PORT}`);
};

/**
 * Starts the renderer service.
 * Loads the renderer server module and begins listening on the configured port.
 */
const startRenderer = async () => {
  const logger = (await import(`${moduleSourceDirectory}/common/logger.js`)).default;
  logger.info('Starting renderer service.');

  const { default: createRendererServer } = await import(`${moduleSourceDirectory}/server/renderer/renderer.js`);

  const rendererServer = createRendererServer();
  const listen = promisify(rendererServer.listen).bind(rendererServer);
  await listen(RENDERER_PORT);

  logger.info(`Renderer service listening on port: ${RENDERER_PORT}`);
};

/**
 * Starts the cron service.
 * Initializes and starts cron jobs using the provided modules.
 */
const startCron = async ({ modules }) => {
  const logger = (await import(`${moduleSourceDirectory}/common/logger.js`)).default;
  logger.info('Starting cron service.');

  if (CRON_WHITELIST) {
    logger.info(`Whitelisted cron jobs: ${CRON_WHITELIST}`);
  }

  const { initCronJobs } = await import(`${moduleSourceDirectory}/cron/cron.js`);
  initCronJobs({ modules });

  logger.info('Cron service started.');
};

/**
 * Uncaught exception handler.
 *
 * The application will log uncaught exceptions. If enough exceptions happen
 * in 1 minute intervals, the application will stop.
 *
 * Make sure you have a daemon restaring your instance when it crashes. eg. pm2
 */
let _uncaughtExceptionHandlerIntervalId = null;
const initUncaughtExceptionHandler = () => {
  if (_uncaughtExceptionHandlerIntervalId) return;

  let errCount = 0;
  const errTreshold = 1500;
  process.on('uncaughtException', (exception) => {
    try {
      console.warn(`Uncaught exception #${errCount}`);
      console.error(exception);
    }
    catch (error) {} // eslint-disable-line no-empty

    errCount += 1;
    if (errCount === errTreshold) {
      console.warn('Fatal uncaught exception, shutting down.');
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (exception) => {
    try {
      console.warn(`Unhandled rejection #${errCount}`);
      console.error(exception);
    }
    catch (error) {} // eslint-disable-line no-empty

    errCount += 1;
    if (errCount === errTreshold) {
      console.warn('Fatal unhandled rejection, shutting down.');
      process.exit(1);
    }
  });

  _uncaughtExceptionHandlerIntervalId = setInterval(() => {
    errCount = 0;
  }, 60000);

  return _uncaughtExceptionHandlerIntervalId;
}

/**
 * Main application entry file.
 * Initializes the application services defined in environmental variables.
 */
const startServices = async ({ modules, knex, config = {} } = {}) => {
  // THROW ERROR check modules are provided
  // const knex = (await import(`${moduleSourceDirectory}/server/db/knex.js`));
  initUncaughtExceptionHandler();

  try {
    const promises = [];

    // Run the latest Knex migrations on startup
    if (config.enableKnexMigrations) {
      if (!knex) {
        // THROW ERROR about knex not provided!
      }
      promises.push(knex.postgresMigrateToLatestSchema({ modules }));
    }

    // Start the API server
    if (config.enableServer) {
      promises.push(startServer({ modules }));
    }

    // Start the renderer service
    if (config.enableRenderer) {
      promises.push(startRenderer());
    }

    // Starts the cron service
    if (config.enableCron) {
      promises.push(startCron({ modules }));
    }

    if (promises.length === 0) {
      throw new Error('No services enabled.');
    }

    // TODO: Start Queue!

    await Promise.all(promises);

    // Uncomment to open the application in a browser in development
    // if (NODE_ENV === 'development' && ENABLE_SERVER === 'true') {
    //   open(`http://localhost:${APP_PORT}`);
    // }
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default startServices;
