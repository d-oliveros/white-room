import createCronCluster from 'cron-cluster';
import { serializeError } from 'serialize-error';
import lodashMemoize from 'lodash/fp/memoize';

import {
  postSlackMessage,
  SLACK_IDENTITY_CRON,
} from 'server/lib/slackClient';

import redis from 'server/db/redis';
import tasks from 'cron/tasks';

const {
  ENABLE_CRON,
  CRON_WHITELIST,
} = process.env;

const cronCluster = createCronCluster(redis);
const cronJobs = {};

/**
 * Wrapper for a cron task's handler. Runs the cron task and posts success/failure notifications.
 *
 * @param  {Function} options.task                   Cron function to call.
 * @param  {string} options.taskName                 Cron task name.
 * @param  {string} options.onlyReportErrorsOverride Overrides the onlyReportErrors config param.
 * @return {Promise<undefined, Error>}
 */
export function runCronTask({ task, taskName, onlyReportErrorsOverride }) {
  let onlyReportErrors = onlyReportErrorsOverride || false;
  let cronSlackChannel = 'cron';
  let cronErrorSlackChannel = null;
  let timeoutMs = null;

  if (typeof __config.cron[taskName] === 'object') {
    cronSlackChannel = __config.cron[taskName].slackChannel || cronSlackChannel;
    if (typeof __config.cron[taskName].onlyReportErrors === 'boolean') {
      onlyReportErrors = typeof onlyReportErrorsOverride === 'boolean'
        ? onlyReportErrorsOverride
        : !!__config.cron[taskName].onlyReportErrors;
    }
    cronErrorSlackChannel = __config.cron[taskName].errorSlackChannel || null;
    timeoutMs = (__config.cron[taskName].timeout * 1000) || null;
  }

  return async function runCronTaskAsync(...args) {
    let now;
    try {
      if (!onlyReportErrors) {
        __log.info(`[cron:${taskName}] Running.`);
      }
      now = Date.now();

      // Runs the cron job, but throw an error if the execution time exceeds the timeout setting.
      const result = await new Promise((resolve, reject) => {
        let isResolved = false;

        if (timeoutMs) {
          setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              const error = new Error(`Cron task timeout after ${timeoutMs} ms: ${taskName}`);
              error.name = 'CronTaskTimeoutError';
              error.details = {
                taskName,
                timeoutMs,
              };
              reject(error);
            }
          }, timeoutMs);
        }

        Promise.resolve()
          .then(() => {
            return task(...args);
          })
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
        __log.info(
          `[cron:${taskName}] Success after ${((Date.now() - now) / 1000).toFixed(2)} seconds.` +
          (result ? `\nMessage: ${JSON.stringify(result, null, 2)}` : '')
        );
      }
    }
    catch (error) {
      const cronError = new Error(`[cron:${taskName}] Error: ${error.message}`);
      cronError.stack = error.stack;
      cronError.inner = error;
      cronError.details = {
        taskName,
      };
      __log.error(cronError);
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
  if (typeof __config.cron[taskName] === 'object') {
    return __config.cron[taskName].executionInterval;
  }
  return __config.cron[taskName];
};

/**
 * Returns whether a cron job is whitelisted.
 * @param  {string} taskName
 * @return {boolean}
 */
const isCronJobWhitelisted = (taskName) => {
  if (ENABLE_CRON === 'true') {
    return true;
  }
  if (ENABLE_CRON === 'whitelist_only') {
    return (CRON_WHITELIST || '').split(',').includes(taskName);
  }
  return false;
};

/**
 * Starts the cron jobs.
 */
export const initCronJobs = lodashMemoize(() => {
  Object.keys(tasks).forEach((taskName) => {
    const task = tasks[taskName];
    const executionInterval = getCronExecutionInterval(taskName);

    if (executionInterval && isCronJobWhitelisted(taskName)) {
      cronJobs[taskName] = new cronCluster.CronJob(executionInterval, runCronTask({
        task,
        taskName,
      }));
      cronJobs[taskName].start();
    }
  });

  return cronJobs;
});