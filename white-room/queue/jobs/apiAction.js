import {
  actionSpecsList,
} from '#api/index.js';

import {
  QUEUE_JOB_API_ACTION,
} from '#queue/jobTypes.js';

export default {
  name: QUEUE_JOB_API_ACTION,
  concurrency: 3,
  process: async (job, done) => {
    const actionSpec = actionSpecsList.find(({ type }) => type === job.data.type);
    await actionSpec.handler({
      session: job.data.session,
      payload: job.data.payload,
    });
    done();
  },
};
