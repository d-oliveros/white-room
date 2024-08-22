import lodashValues from 'lodash/fp/values.js';

const transformCrontab = (crontab) => {
  const transformed = {};

  for (const key in crontab) {
    if (Object.prototype.hasOwnProperty.call(crontab, key)) {
      const newKey = key.replace('.service', '');
      transformed[newKey] = crontab[key];
    }
  }

  return transformed;
}

export const getPeriodicFunctionsFromModules = (modules) => {
  const periodicFunctions = [];

  lodashValues(modules).forEach(({ service, crontab }) => {
    if (service && crontab) {
      const _crontab = transformCrontab(crontab);
      service.forEach(({ id, handler }) => {
        if (_crontab[id]) {
          periodicFunctions.push({
            serviceId: id,
            handler: handler,
            crontab: _crontab[id],
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
  logger.info('Starting cron service');

  const { initCronJobs } = await import(`../server/cron/cron.js`);
  initCronJobs({ periodicFunctions });

  logger.info('Cron service started.');
};

export default startCron;
