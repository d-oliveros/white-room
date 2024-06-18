import {
  processStatusUpdate,
} from '#common/stateMachine';

import {
  QUEUE_JOB_PROCESS_STATUS_UPDATE,
} from '#queue/jobTypes';

export default {
  name: QUEUE_JOB_PROCESS_STATUS_UPDATE,
  concurrency: 5,
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
