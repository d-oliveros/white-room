import { postSlackMessage } from '#server/lib/slackClient';

import logger from '#common/logger.js';
import { QUEUE_JOB_SLACK_MESSAGES } from '#queue/jobTypes';

export default {
  name: QUEUE_JOB_SLACK_MESSAGES,
  concurrency: 5,
  process: async (job, done) => {
    try {
      const postSlackMessageErrors = [];
      for (const slackMessage of job.data) {
        try {
          await postSlackMessage(slackMessage);
        }
        catch (postSlackMessageError) {
          logger.error(postSlackMessageError);
          postSlackMessageErrors.push(postSlackMessageError);
        }
      }
      if (postSlackMessageErrors.length) {
        const errorMessage = postSlackMessageErrors
          .map(({ message }) => message)
          .join(' | ');
        const error = new Error(`Errors encountered: ${errorMessage}`);
        error.inner = {
          errors: postSlackMessageErrors,
        };
        done(error);
      }
      else {
        done();
      }
    }
    catch (error) {
      done(error);
    }
  },
};
