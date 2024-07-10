import lodashValues from 'lodash/fp/values.js';

export const getPeriodicFunctionsFromModules = (modules) => {
  const periodicFunctions = [];

  lodashValues(modules).forEach(({ service, crontab }) => {
    if (service && crontab) {
      service.forEach(({ id, handler }) => {
        if (crontab[id]) {
          periodicFunctions.push({
            serviceId: id,
            service: handler,
            crontab: crontab[id],
          });
        }
      });
    }
  });

  return periodicFunctions;
};

/**
 * Starts the cron service.
 * Initializes and starts cron jobs using the provided modules.
 */
const startCron = async ({ periodicFunctions }) => {
  const logger = (await import(`../logger.js`)).default;
  logger.info('Starting cron service.');

  const { initCronJobs } = await import(`../server/cron/cron.js`);
  initCronJobs({ periodicFunctions });

  logger.info('Cron service started.');
};

export default startCron;
