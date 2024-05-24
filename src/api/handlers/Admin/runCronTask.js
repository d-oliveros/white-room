import typeCheck from 'common/util/typeCheck';

import { runCronTask } from 'cron/index';
import cronTasks from 'cron/tasks';

import {
  USER_ROLE_ADMIN,
} from 'common/userRoles';

import {
  postSlackMessage,
} from 'server/lib/slackClient';

import {
  API_ACTION_ADMIN_RUN_CRON_TASK,
} from 'api/actionTypes';

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
    __log.info(`[cron:${cronTaskName}] Manually triggered.`);
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
