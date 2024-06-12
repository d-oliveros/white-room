import { promisify } from 'util';

const {
  APP_PORT,
  USE_BUILD,
  RENDERER_PORT,
  ENABLE_SERVER,
  ENABLE_RENDERER,
  ENABLE_CRON,
  ENABLE_KNEX_MIGRATIONS,
  CRON_WHITELIST,
} = process.env;

// TODO: Check if module resolver works in this scope!

const moduleSourceDirectory = USE_BUILD === 'true' ? './lib' : './src';

const knex = (await import(`${moduleSourceDirectory}/server/db/knex.js`));
const logger = (await import(`${moduleSourceDirectory}/common/logger.js`)).default;

const startServer = async () => {
  logger.info('Starting server.');
  const { default: server } = await import(`${moduleSourceDirectory}/server/server.js`);

  const listen = promisify(server.listen).bind(server);
  await listen(APP_PORT);
  logger.info(`Server listening on port: ${APP_PORT}`);
};

const startRenderer = async () => {
  logger.info('Starting renderer service.');
  const { default: rendererApi } = await import(`${moduleSourceDirectory}/server/renderer/rendererApi.js`);

  const listen = promisify(rendererApi.listen).bind(rendererApi);
  await listen(RENDERER_PORT);
  logger.info(`Renderer service listening on port: ${RENDERER_PORT}`);
};

const startCron = async () => {
  const startLogMessage = ENABLE_CRON === 'whitelist_only'
    ? 'Starting cron service in whitelist only mode.'
    : 'Starting cron service.';

  logger.info(startLogMessage);

  if (ENABLE_CRON === 'whitelist_only') {
    if (!CRON_WHITELIST) {
      throw new Error('CRON_WHITELIST is not defined.');
    }
    logger.info(`Whitelisted cron jobs: ${CRON_WHITELIST}`);
  }

  const { initCronJobs } = await import(`${moduleSourceDirectory}/cron/cron.js`);
  initCronJobs();

  logger.info('Cron service started.');
};

/**
 * Main application entry file.
 * Initializes the application services defined in environmental variables.
 */
const init = async () => {
  try {
    const promises = [];

    // Run the latest Knex migrations on startup
    if (ENABLE_KNEX_MIGRATIONS === 'true') {
      promises.push(knex.postgresMigrateToLatestSchema());
    }

    // Start the API server
    if (ENABLE_SERVER === 'true') {
      promises.push(startServer());
    }

    // Start the renderer service
    if (ENABLE_RENDERER === 'true') {
      promises.push(startRenderer());
    }

    // Starts the cron service
    if (ENABLE_CRON === 'true') {
      promises.push(startCron());
    }

    if (promises.length === 0) {
      throw new Error('No services enabled.');
    }

    // TODO: Start Queue!

    await Promise.all(promises);

  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

/**
 * Uncaught exception handler.
 *
 * The application will log uncaught exceptions. If enough exceptions happen
 * in 1 minute intervals, the application will stop.
 *
 * Make sure you have a daemon restaring your instance when it crashes. eg. pm2
 */
let errCount = 0;
const errTreshold = 1500;
process.on('uncaughtException', (exception) => {
  try {
    logger.warn(`Uncaught exception #${errCount}`);
    logger.error(exception);
  } catch (error) {} // eslint-disable-line no-empty

  errCount += 1;
  if (errCount === errTreshold) {
    logger.warn('Fatal uncaught exception, shutting down.');
    process.exit(1);
  }
});

process.on('unhandledRejection', (exception) => {
  try {
    logger.warn(`Unhandled rejection #${errCount}`);
    logger.error(exception);
  } catch (error) {} // eslint-disable-line no-empty

  errCount += 1;
  if (errCount === errTreshold) {
    logger.warn('Fatal unhandled rejection, shutting down.');
    process.exit(1);
  }
});

setInterval(() => {
  errCount = 0;
}, 60000);

// Initialize the service.
init();
