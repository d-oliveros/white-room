import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import { runPeriodicFunction } from '#cron/cron.js';

import {
  USER_ROLE_ADMIN,
} from '#common/userRoles.js';

import {
  postSlackMessage,
} from '#server/lib/slackClient.js';

import {
  API_ACTION_ADMIN_RUN_CRON_TASK,
} from '#api/actionTypes.js';

export default {
  type: API_ACTION_ADMIN_RUN_CRON_TASK,
  roles: [
    USER_ROLE_ADMIN,
  ],
  validate: ({ serverFunctionId }) => {
    typeCheck('serverFunctionId::NonEmptyString', serverFunctionId);
  },
  async handler({ payload: { serverFunctionId } }) {
    logger.info(`[cron:${serverFunctionId}] Manually triggered.`);
    await postSlackMessage({
      channel: 'cron',
      attachments: [
        {
          fallback: `Manually triggered "${serverFunctionId}"`,
          title: `Manually triggered "${serverFunctionId}"`,
          color: '#ffcd00',
        },
      ],
    });

    await runPeriodicFunction({
      serverFunctionId,
      onlyReportErrorsOverride: false,
    })();
  },
};
