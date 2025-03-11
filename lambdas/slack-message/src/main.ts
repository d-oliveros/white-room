import type { SlackMessage } from './slackClient.schemas';
import { createLogger } from '@namespace/logger';
import { lambdaHandler } from '@namespace/lambda-handler';

import { postSlackMessage } from './slackClient';

const logger = createLogger('slack-message');

/**
 * This Lambda handler is responsible for sending messages to Slack.
 */
export const handler = lambdaHandler<SlackMessage, void>(async (slackMessage) => {
  try {
    await postSlackMessage(slackMessage);
  } catch (error) {
    logger.error(error, 'Error sending Slack message');
    throw error;
  }
});
