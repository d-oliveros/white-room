import redis from '#server/db/redis.js';
import { sendTwilioText } from '#server/lib/twilioClient.js';

import {
  QUEUE_JOB_TWILIO_TEXT,
} from '#queue/jobTypes.js';

export default {
  name: QUEUE_JOB_TWILIO_TEXT,
  concurrency: 3,

  process: async (job, done) => {
    try {
      const {
        senderId,
        phone,
        message,
      } = job.data;

      const sender = await redis.get(senderId);

      await sendTwilioText({
        sender: sender,
        phone: phone,
        message: message,
      });

      done();
    }
    catch (err) {
      done(err);
    }
  },
};
