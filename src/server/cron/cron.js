import { serializeError } from 'serialize-error';
import cron from 'node-cron';

import logger from '../../logger.js';
import redis from '../db/redis.js';

import {
  postSlackMessage,
  SLACK_IDENTITY_CRON,
} from '../lib/slackClient.js';

const {
  ENABLE_CRON,
  CRON_WHITELIST,
  TZ,
} = process.env;

/**
 * Wrapper for a cron fn's handler. Runs the cron fn and posts success/failure notifications.
 *
 * @param  {string} serviceId                Cron fn name.
 * @param  {string} onlyReportErrorsOverride Overrides the onlyReportErrors config param.
 * @param  {string} crontab                  Cron tab.
 * @return {Function}
 */
export function runPeriodicService({ service, config = {} }) {
  const {
    id: serviceId,
    handler,
  } = service;

  const {
    onlyReportErrors = false,
    slackChannel = null,
    errorSlackChannel = null,
    timeoutMs,
  } = config;

  return async () => {
    let now;

    if (!redis?.isLeader) {
      // Not the leader, skip execution
      return;
    }

    try {
      if (!onlyReportErrors) {
        logger.info(`[cron:${serviceId}] Running.`);
      }
      now = Date.now();

      const result = await new Promise((resolve, reject) => {
        let isResolved = false;

        if (timeoutMs) {
          setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              const error = new Error(`Cron function timeout after ${timeoutMs} ms: ${serviceId}`);
              error.name = 'CronTaskTimeoutError';
              error.details = { serviceId, timeoutMs };
              reject(error);
            }
          }, timeoutMs);
        }

        Promise.resolve(handler())
          .then((result) => {
            if (!isResolved) {
              isResolved = true;
              resolve(result);
            }
          })
          .catch((error) => {
            if (!isResolved) {
              isResolved = true;
              reject(error);
            }
          });
      });

      if (!onlyReportErrors) {
        logger.info(
          `[cron:${serviceId}] Success after ${((Date.now() - now) / 1000).toFixed(2)} seconds.` +
          (result ? `\nMessage: ${JSON.stringify(result, null, 2)}` : '')
        );
      }
    } catch (error) {
      const cronError = new Error(`[cron:${serviceId}] Error: ${error.message}`, { cause: error });
      cronError.stack = error.stack;
      cronError.details = { serviceId };
      logger.error(cronError);
      const errorSlackMessageAttachments = [
        {
          fallback: `Failure: "${serviceId}"`,
          title: `Failure: "${serviceId}"`,
          color: '#ff0000',
          text: (
            `Failure after ${((Date.now() - now) / 1000).toFixed(2)} seconds.\n` +
            `Error: ${JSON.stringify(serializeError(error), null, 2)}`
          ),
        },
      ];

      if (slackChannel) {
        await postSlackMessage({
          channel: slackChannel,
          identity: SLACK_IDENTITY_CRON,
          attachments: errorSlackMessageAttachments,
        });
      }

      if (errorSlackChannel) {
        await postSlackMessage({
          channel: errorSlackChannel,
          identity: SLACK_IDENTITY_CRON,
          attachments: errorSlackMessageAttachments,
        });
      }
    }
  };
}

/**
 * Returns whether a cron job is whitelisted.
 * @param  {string} serviceId
 * @return {boolean}
 */
const isCronJobWhitelisted = (serviceId) => {
  if (ENABLE_CRON === 'true') {
    if (CRON_WHITELIST) {
      return (CRON_WHITELIST || '').split(',').includes(serviceId);
    }
    return true;
  }
  return false;
};

let cronJobsLoaded = false;

/**
 * Starts the cron jobs.
 */
export const initCronJobs = async ({ periodicFunctions }) => {
  if (cronJobsLoaded) return true;

  if (!periodicFunctions || !Array.isArray(periodicFunctions)) {
    throw new Error('Periodic functions must be provided as an array');
  }

  console.log('Initializing cron jobs with the following periodic functions:', periodicFunctions);

  for (const { serviceId, service, crontab } of periodicFunctions) {
    if (!service) {
      logger.warn(`[cron] Warning: Service handler for ${serviceId} was not found.`);
      continue;
    }

    if (isCronJobWhitelisted(serviceId)) {
      try {
        cron.schedule(crontab, () => runPeriodicService({ serviceId, service }), {
          scheduled: true,
          timezone: TZ,
        });
        logger.info(`[cron] Scheduled ${serviceId} with crontab: ${crontab}`);
      }
      catch (error) {
        logger.error(`[cron] Failed to schedule ${serviceId} with crontab: ${crontab}`, error);
      }
    }
    else {
      logger.info(`[cron] ${serviceId} is not whitelisted and will not be scheduled.`);
    }
  }

  cronJobsLoaded = true;

  // TODO: Return interface to stop cron jobs.
  return true;
};
