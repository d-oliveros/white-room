import { serializeError } from 'serialize-error';
import cron from 'node-cron';

import logger from '#common/logger.js';
import redis from '#server/db/redis.js';

import {
  postSlackMessage,
  SLACK_IDENTITY_CRON,
} from '#server/lib/slackClient.js';

import crontab from '#cron/crontab.js';

const {
  ENABLE_CRON,
  CRON_WHITELIST,
  TZ,
} = process.env;

const cronTabEntries = Object.keys(crontab);

/**
 * Wrapper for a cron fn's handler. Runs the cron fn and posts success/failure notifications.
 *
 * @param  {string} options.serverFunctionId                 Cron fn name.
 * @param  {string} options.onlyReportErrorsOverride Overrides the onlyReportErrors config param.
 * @return {Function}
 */
export function runPeriodicFunction({ serverFunctionId, onlyReportErrorsOverride }) {
  const fn = serverFunctionsLoaded.value[serverFunctionId];

  let onlyReportErrors = onlyReportErrorsOverride || false;
  let cronSlackChannel = 'cron';
  let cronErrorSlackChannel = null;
  let timeoutMs = null;

  if (typeof crontab[serverFunctionId] === 'object') {
    cronSlackChannel = crontab[serverFunctionId].slackChannel || cronSlackChannel;
    if (typeof crontab[serverFunctionId].onlyReportErrors === 'boolean') {
      onlyReportErrors = typeof onlyReportErrorsOverride === 'boolean'
        ? onlyReportErrorsOverride
        : !!crontab[serverFunctionId].onlyReportErrors;
    }
    cronErrorSlackChannel = crontab[serverFunctionId].errorSlackChannel || null;
    timeoutMs = (crontab[serverFunctionId].timeout * 1000) || null;
  }

  return async () => {
    let now;

    if (!redis?.isLeader) {
      // Not the leader, skip execution
      return;
    }

    try {
      if (!onlyReportErrors) {
        logger.info(`[cron:${serverFunctionId}] Running.`);
      }
      now = Date.now();

      const result = await new Promise((resolve, reject) => {
        let isResolved = false;

        if (timeoutMs) {
          setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              const error = new Error(`Cron function timeout after ${timeoutMs} ms: ${serverFunctionId}`);
              error.name = 'CronTaskTimeoutError';
              error.details = { serverFunctionId, timeoutMs };
              reject(error);
            }
          }, timeoutMs);
        }

        Promise.resolve(fn())
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
          `[cron:${serverFunctionId}] Success after ${((Date.now() - now) / 1000).toFixed(2)} seconds.` +
          (result ? `\nMessage: ${JSON.stringify(result, null, 2)}` : '')
        );
      }
    } catch (error) {
      const cronError = new Error(`[cron:${serverFunctionId}] Error: ${error.message}`);
      cronError.stack = error.stack;
      cronError.inner = error;
      cronError.details = { serverFunctionId };
      logger.error(cronError);
      const errorSlackMessageAttachments = [
        {
          fallback: `Failure: "${serverFunctionId}"`,
          title: `Failure: "${serverFunctionId}"`,
          color: '#ff0000',
          text: (
            `Failure after ${((Date.now() - now) / 1000).toFixed(2)} seconds.\n` +
            `Error: ${JSON.stringify(serializeError(error), null, 2)}`
          ),
        },
      ];

      await postSlackMessage({
        channel: cronSlackChannel,
        identity: SLACK_IDENTITY_CRON,
        attachments: errorSlackMessageAttachments,
      });

      if (cronErrorSlackChannel) {
        await postSlackMessage({
          channel: cronErrorSlackChannel,
          identity: SLACK_IDENTITY_CRON,
          attachments: errorSlackMessageAttachments,
        });
      }
    }
  };
}

/**
 * Returns the execution interval for a cron fn.
 * @param  {string} serverFunctionId
 * @return {string}
 */
const getCronExecutionInterval = (serverFunctionId) => {
  if (typeof crontab[serverFunctionId] === 'object') {
    return crontab[serverFunctionId].executionInterval;
  }
  return crontab[serverFunctionId];
};

/**
 * Returns whether a cron job is whitelisted.
 * @param  {string} serverFunctionId
 * @return {boolean}
 */
const isCronJobWhitelisted = (serverFunctionId) => {
  if (ENABLE_CRON === 'true') {
    if (CRON_WHITELIST) {
      return (CRON_WHITELIST || '').split(',').includes(serverFunctionId);
    }
    return true;
  }
  return false;
};

const getServerFunctions = (modules) => {
  const serverFunctions = modules
    .reduce((memo, { serverFunctions: moduleServerFunctions }) => {
      return {
        ...memo,
        ...(moduleServerFunctions || []).map(({ id, handler }) => ({
          [id]: handler,
        })),
      };
    }, {});

  return serverFunctions;
}

const serverFunctionsLoaded = {
  value: null,
};

/**
 * Starts the cron jobs.
 */
export const initCronJobs = async ({ modules }) => {
  console.log('initCronJobs', modules);
  if (serverFunctionsLoaded.value) {
    return serverFunctionsLoaded.value;
  }

  const serverFunctions = getServerFunctions(modules);
  serverFunctionsLoaded.value = serverFunctions;

  for (const serverFunctionId of cronTabEntries) {
    if (crontab[serverFunctionId]) {
      if (!serverFunctions[serverFunctionId]) {
        logger.warn(`[cron] Warning: ${serverFunctionId} was not found in \`modules\``);
      }
      else {
        const executionInterval = getCronExecutionInterval(serverFunctionId);

        if (executionInterval && isCronJobWhitelisted(serverFunctionId)) {
          cron.schedule(executionInterval, runPeriodicFunction({ serverFunctionId }), {
            scheduled: true,
            timezone: TZ,
          });
        }
      }
    }
  }

  return serverFunctions;
};
