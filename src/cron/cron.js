import { serializeError } from 'serialize-error';
import cron from 'node-cron';
import lodashMemoize from 'lodash/fp/memoize.js';

import logger from '#common/logger.js';
import redis from '#server/db/redis.js';

import {
  postSlackMessage,
  SLACK_IDENTITY_CRON,
} from '#server/lib/slackClient.js';

import crontab from '#cron/crontab.js';
import tasks from '#cron/tasks/index.js';

const {
  ENABLE_CRON,
  CRON_WHITELIST,
  TZ,
} = process.env;

/**
 * Wrapper for a cron task's handler. Runs the cron task and posts success/failure notifications.
 *
 * @param  {Function} options.task                   Cron function to call.
 * @param  {string} options.taskName                 Cron task name.
 * @param  {string} options.onlyReportErrorsOverride Overrides the onlyReportErrors config param.
 * @return {Function}
 */
export function runCronTask({ task, taskName, onlyReportErrorsOverride }) {
  let onlyReportErrors = onlyReportErrorsOverride || false;
  let cronSlackChannel = 'cron';
  let cronErrorSlackChannel = null;
  let timeoutMs = null;

  if (typeof crontab[taskName] === 'object') {
    cronSlackChannel = crontab[taskName].slackChannel || cronSlackChannel;
    if (typeof crontab[taskName].onlyReportErrors === 'boolean') {
      onlyReportErrors = typeof onlyReportErrorsOverride === 'boolean'
        ? onlyReportErrorsOverride
        : !!crontab[taskName].onlyReportErrors;
    }
    cronErrorSlackChannel = crontab[taskName].errorSlackChannel || null;
    timeoutMs = (crontab[taskName].timeout * 1000) || null;
  }

  return async function processJob() {
    const args = []; // Adjust if there are arguments needed
    let now;

    if (!redis?.isLeader) {
      // Not the leader, skip execution
      return;
    }

    try {
      if (!onlyReportErrors) {
        logger.info(`[cron:${taskName}] Running.`);
      }
      now = Date.now();

      const result = await new Promise((resolve, reject) => {
        let isResolved = false;

        if (timeoutMs) {
          setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              const error = new Error(`Cron task timeout after ${timeoutMs} ms: ${taskName}`);
              error.name = 'CronTaskTimeoutError';
              error.details = { taskName, timeoutMs };
              reject(error);
            }
          }, timeoutMs);
        }

        Promise.resolve()
          .then(() => task(...args))
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
          `[cron:${taskName}] Success after ${((Date.now() - now) / 1000).toFixed(2)} seconds.` +
          (result ? `\nMessage: ${JSON.stringify(result, null, 2)}` : '')
        );
      }
    } catch (error) {
      const cronError = new Error(`[cron:${taskName}] Error: ${error.message}`);
      cronError.stack = error.stack;
      cronError.inner = error;
      cronError.details = { taskName };
      logger.error(cronError);
      const errorSlackMessageAttachments = [
        {
          fallback: `Failure: "${taskName}"`,
          title: `Failure: "${taskName}"`,
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
 * Returns the execution interval for a cron task.
 * @param  {string} taskName
 * @return {string}
 */
const getCronExecutionInterval = (taskName) => {
  if (typeof crontab[taskName] === 'object') {
    return crontab[taskName].executionInterval;
  }
  return crontab[taskName];
};

/**
 * Returns whether a cron job is whitelisted.
 * @param  {string} taskName
 * @return {boolean}
 */
const isCronJobWhitelisted = (taskName) => {
  if (ENABLE_CRON === 'true') {
    if (CRON_WHITELIST) {
      return (CRON_WHITELIST || '').split(',').includes(taskName);
    }
    return true;
  }
  return false;
};

/**
 * Starts the cron jobs.
 */
export const initCronJobs = lodashMemoize(async () => {
  Object.keys(tasks).forEach((taskName) => {
    const task = tasks[taskName];
    const executionInterval = getCronExecutionInterval(taskName);

    if (executionInterval && isCronJobWhitelisted(taskName)) {
      cron.schedule(executionInterval, runCronTask({
        task,
        taskName,
      }), {
        scheduled: true,
        timezone: TZ,
      });
    }
  });
});
