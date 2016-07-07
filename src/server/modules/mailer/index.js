import { map, extend } from 'lodash';
import tasks from './tasks';
import { sendMail, sanitizeParams, subscribeToList } from './util';

const debug = __log.debug('boilerplate:mailer');

export default async function mailer(taskName, params) {
  const { EmailLog } = require('../../models');

  params = sanitizeParams(params);

  const task = tasks[taskName];
  const emails = params.emails;
  let mailVars = [];

  // Subscribe the user to a mailchimp list
  if (task.subscribe) {
    debug(`Subscribing ${JSON.stringify(emails)} to ${task.subscribe}`);
    subscribeToList(emails, task.subscribe);
  }

  // Prepare the variables using the task's getVars method
  if (task.getVars) {
    mailVars = task.getVars(params);
  }

  if (!task.send) {
    return;
  }

  debug(
    `Sending ${task.send.templateName}: ${JSON.stringify(mailVars)} ` +
    `to ${JSON.stringify(emails)}`);

  await sendMail(emails, task.send, mailVars);

  const logs = map(params.emails, (data) => {
    return extend(data, {
      data: mailVars,
      created: new Date(),
      name: taskName
    });
  });

  return await EmailLog.create(logs);
}
