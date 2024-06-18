import typeCheck from '#common/util/typeCheck.js';

import logger from '#common/logger.js';
import { runCronTask } from '#cron/cron.js';
import cronTasks from '#cron/tasks/index.js';

import {
  USER_ROLE_ADMIN,
} from '#common/userRoles.js';

import {
  postSlackMessage,
} from '#server/lib/slackClient.js';

import {
  API_ACTION_ADMIN_RUN_CRON_TASK,
} from '#api/actionTypes.js';

const availableCronTasks = Object.keys(cronTasks);

export default {
  type: API_ACTION_ADMIN_RUN_CRON_TASK,
  roles: [
    USER_ROLE_ADMIN,
  ],
  validate({ cronTaskName }) {
    typeCheck('cronTaskName::ValidCronTaskName', cronTaskName, {
      customTypes: {
        ValidCronTaskName: {
          typeOf: 'String',
          validate: (x) => x && availableCronTasks.includes(x),
        },
      },
    });
  },
  async handler({ payload: { cronTaskName } }) {
    logger.info(`[cron:${cronTaskName}] Manually triggered.`);
    await postSlackMessage({
      channel: 'cron',
      attachments: [
        {
          fallback: `Manually triggered "${cronTaskName}"`,
          title: `Manually triggered "${cronTaskName}"`,
          color: '#ffcd00',
        },
      ],
    });

    return runCronTask({
      task: cronTasks[cronTaskName],
      taskName: cronTaskName,
      onlyReportErrorsOverride: false,
    })();
  },
};
