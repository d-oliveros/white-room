/* eslint-disable import/no-dynamic-require */
require('./_initEnv');

const {
  APP_PORT,
  USE_BUILD,
  RENDERER_PORT,
  ENABLE_SERVER,
  ENABLE_RENDERER,
  ENABLE_CRON,
  CRON_WHITELIST,
} = process.env;

const moduleSourceDirectory = USE_BUILD === 'true' ? './lib' : './src';
const knex = require(`${moduleSourceDirectory}/server/db/knex`);

/**
 * Main application entry file.
 * Initializes the application services defined in environmental variables.
 */
Promise.resolve()
  .then(() => {
    /**
     * Runs the latest database evolution.
     */
    __log.info('Checking if schema migration is needed.');
    return knex.postgresMigrateToLatestSchema();
  })
  .then(() => {
    /**
     * Starts the API server.
     */
    if (ENABLE_SERVER === 'true') {
      __log.info('Starting server.');
      const server = require(`${moduleSourceDirectory}/server/server`).default;

      server.listen(APP_PORT, (err) => {
        if (err) {
          __log.error(err);
          return;
        }
        __log.info(`Server listening on port: ${APP_PORT}`);
      });
    }

    /**
     * Starts the Renderer service.
     */
    if (ENABLE_RENDERER === 'true') {
      __log.info('Starting renderer API.');
      const rendererApi = require(`${moduleSourceDirectory}/server/renderer/rendererApi`).default;

      rendererApi.listen(RENDERER_PORT, () => {
        __log.info(`Renderer service listening on port: ${RENDERER_PORT}`);
      });
    }

    /**
     * Starts the Cron service.
     */
    if (ENABLE_CRON === 'true' || ENABLE_CRON === 'whitelist_only') {
      const startLogMessage = ENABLE_CRON === 'whitelist_only'
        ? 'Starting cron service in whitelist only mode.'
        : 'Starting cron service.';

      __log.info(startLogMessage);

      if (ENABLE_CRON === 'whitelist_only') {
        if (!CRON_WHITELIST) {
          throw new Error('CRON_WHITELIST is not defined.');
        }
        __log.info(`Whitelisted cron jobs: ${CRON_WHITELIST}`);
      }

      const initCronJobs = require(`${moduleSourceDirectory}/cron`).initCronJobs;
      initCronJobs();

      __log.info('Cron service started.');
    }
  })
  .catch((error) => {
    __log.error(error);
    process.exit(1);
  });

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
    __log.warn(`Uncaught exception #${errCount}`);
    __log.error(exception);
  }
  catch (error) {} // eslint-disable-line no-empty

  errCount += 1;
  if (errCount === errTreshold) {
    __log.warn('Fatal uncaught exception, shutting down.');
    process.exit(1);
  }
});

process.on('unhandledRejection', (exception) => {
  try {
    __log.warn(`Unhandled rejection #${errCount}`);
    __log.error(exception);
  }
  catch (error) {} // eslint-disable-line no-empty

  errCount += 1;
  if (errCount === errTreshold) {
    __log.warn('Fatal unhandled rejection, shutting down.');
    process.exit(1);
  }
});

setInterval(() => {
  errCount = 0;
}, 60000);
