import { createLogger } from '@namespace/logger';
import { SlackMessageSchema, type SlackMessage } from './slackClient.schemas';

const { NODE_ENV, SLACK_ENDPOINT, SLACK_REDIRECT_MESSAGES_CHANNEL } = process.env;

const SLACK_DEFAULT_IDENTITY = {
  username: 'Namespace',
  icon_url:
    'https://scontent-dft4-3.cdninstagram.com/t51.2885-19/s150x150/26156312_149032262551417_9037969426946719744_n.jpg',
};

const logger = createLogger('slackClient');

function assertSlackEnabled(slackEndpoint: string | undefined): asserts slackEndpoint is string {
  if (!slackEndpoint && NODE_ENV !== 'test') {
    throw new Error('SLACK_ENDPOINT environment variable is not set');
  }
}

function parseSlackMessage(slackMessage: SlackMessage) {
  const result = SlackMessageSchema.safeParse(slackMessage);
  if (!result.success) {
    throw new Error(`Invalid slack message: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Posts a message to a slack channel, using one of the preset identities defined above.
 *
 * @param  {SlackMessage} slackMessage The slack message to post.
 * @return {null}
 */
export async function postSlackMessage(slackMessage: SlackMessage) {
  slackMessage = parseSlackMessage(slackMessage);

  assertSlackEnabled(SLACK_ENDPOINT);

  const { channel, blocks, text, identity = SLACK_DEFAULT_IDENTITY } = slackMessage;

  try {
    const slackBody = {
      channel: SLACK_REDIRECT_MESSAGES_CHANNEL || channel,
      blocks,
      text,
      username: identity.username,
      icon_url: identity.icon_url,
    };

    if (
      slackBody.channel === SLACK_REDIRECT_MESSAGES_CHANNEL &&
      channel !== SLACK_REDIRECT_MESSAGES_CHANNEL &&
      Array.isArray(slackBody.blocks)
    ) {
      slackBody.blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Original Channel:*\n#${channel}`,
          },
        ],
      });
    }

    const slackResponse = await fetch(SLACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackBody),
    });

    if (!slackResponse.ok) {
      const errorMessage = await slackResponse.text();
      throw new Error(`HTTP error! status: ${slackResponse.status}, message: ${errorMessage}`);
    }
    return null;
  } catch (error) {
    (error as Error).name = 'SlackError';
    logger.error(error);
  }
  return null;
}
