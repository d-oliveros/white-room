import {
  sendMail,
} from '#server/lib/sendgridClient.js';

import {
  QUEUE_JOB_SENDGRID_EMAIL,
} from '#queue/jobTypes.js';

export default {
  name: QUEUE_JOB_SENDGRID_EMAIL,
  concurrency: 10,

  process: async (job, done) => {
    try {
      const {
        templateId,
        attachments,
        recipients,
        cc,
        fromEmail,
        values,
        categories,
        replyTo,
        asm,
      } = job.data;

      await sendMail({
        templateId: templateId,
        attachments: attachments,
        recipients: recipients,
        cc: cc,
        fromEmail: fromEmail,
        values: values,
        categories: categories,
        replyTo,
        asm,
      });

      done();
    }
    catch (err) {
      done(err);
    }
  },
};
