import {
  API_ACTION_PROCESS_STATUS_UPDATE,
} from '#api/actionTypes.js';

import {
  processStatusUpdate,
} from '#common/stateMachine.js';

export default {
  type: API_ACTION_PROCESS_STATUS_UPDATE,
  queueConcurrency: 5,
  process: async (job, done) => {
    try {
      const {
        table,
        id,
        fromStatus,
        toStatus,
      } = job.data;

      await processStatusUpdate({
        table,
        id,
        fromStatus,
        toStatus,
      });

      done();
    }
    catch (err) {
      done(err);
    }
  },
};