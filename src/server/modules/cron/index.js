import { CronJob } from 'cron';
import { memoize, each } from 'lodash';
import tasks from './tasks';

const processes = {};

/**
 * Starts the cron jobs.
 */
export const init = memoize(() => {
  each(tasks, (task, taskName) => {
    const executionInterval = __config.cron[taskName];
    if (executionInterval) {
      processes[taskName] = new CronJob({
        cronTime: executionInterval,
        start: true,
        onTick: task
      });
    }
  });

  return processes;
});
