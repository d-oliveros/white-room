import logger from '#white-room/logger.js';
import typeCheck from '#white-room/util/typeCheck.js';
import { runPeriodicService } from '#white-room/server/cron/cron.js';

import {
  ROLE_ADMIN,
} from '#user/constants/roles.js';

import {
  postSlackMessage,
} from '#white-room/server/lib/slackClient.js';

export default {
  roles: [
    ROLE_ADMIN,
  ],
  validate: ({ serviceId }) => {
    typeCheck('serviceId::NonEmptyString', serviceId);
  },
  async handler({ payload: { serviceId } }) {
    logger.info(`[cron:${serviceId}] Manually triggered.`);
    await postSlackMessage({
      channel: 'cron',
      attachments: [
        {
          fallback: `Manually triggered "${serviceId}"`,
          title: `Manually triggered "${serviceId}"`,
          color: '#ffcd00',
        },
      ],
    });

    await runPeriodicService({
      serviceId,
      onlyReportErrorsOverride: false,
    })();
  },
};
