import assert from 'assert';
import lodashCloneDeep from 'lodash/fp/cloneDeep.js';

import logger from '#whiteroom/logger.js';

const {
  APP_TITLE,
  SLACK_ENDPOINT,
  SLACK_REDIRECT_MESSAGES_CHANNEL,
} = process.env;

const debug = logger.createDebug('slack');

export const isSlackEnabled = !!SLACK_ENDPOINT;

export const SLACK_IDENTITY_SYSTEM = 'SLACK_IDENTITY_SYSTEM';
export const SLACK_IDENTITY_CRON = 'SLACK_IDENTITY_CRON';

export const SLACK_CHANNEL_GENERAL = 'general';
export const SLACK_CHANNEL_CRON = 'cron';

export const SLACK_COLOR_OK = '#00ff00';
export const SLACK_COLOR_WARNING = '#ffff00';
export const SLACK_COLOR_ERROR = '#ff0000';

const slackIdentityToIdentitySettingsMapping = {
  [SLACK_IDENTITY_SYSTEM]: {
    username: APP_TITLE,
    icon_url: 'https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/FPGDGYJXM56KI5CTHHDX3DN2WQ.jpg&w=800', // eslint-disable-line max-len
  },
  [SLACK_IDENTITY_CRON]: {
    username: 'Cron',
    icon_url: 'https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/FPGDGYJXM56KI5CTHHDX3DN2WQ.jpg&w=800', // eslint-disable-line max-len
  },
};

/**
 * Determines if 'channel' is an valid array of strings.
 * @param {array} channels
 * @returns {boolean}
 */
const isValidChannelArray = (channels) => {
  if (!Array.isArray(channels)) {
    return false;
  }
  return channels.every((channel) => typeof channel === 'string');
};

/**
 * Posts a message to a slack channel, using one of the preset identities defined above.
 *
 * @param  {string} params.channel     Slack channel to post the message to.
 * @param  {array}  params.attachments Message attachments. See https://api.slack.com/docs/message-attachments.
 *
 * @return {array}  Slack's API response.
 */
export async function postSlackMessage(params) {
  assert(params && typeof params === 'object', `Invalid params: ${params}`);

  const { channel, attachments } = params;
  const identity = params.identity || SLACK_IDENTITY_SYSTEM;

  assert(
    channel && (typeof channel === 'string' || isValidChannelArray(channel)),
    `channel must be a valid string or an array of strings: ${JSON.stringify(channel)}`
  );

  assert(
    Array.isArray(attachments),
    'attachments must be a valid array. Please see https://api.slack.com/docs/message-attachments.'
  );

  const attachmentsWithColor = attachments.map((attachment) => ({
    ...attachment,
    fallback: attachment.fallback || attachment.title || null,
    color: attachment.color || '#ffcd00',
  }));

  const channels = typeof channel === 'string' ? [channel] : channel;

  if (!isSlackEnabled) {
    debug('Slack is disabled.');
    return;
  }

  const responses = [];
  for (const _channel of channels) {
    logger.createDebug(`Sending slack message to channel ${_channel}`);
    responses.push(
      await sendSingleSlackMessage({
        channel: _channel,
        attachments: lodashCloneDeep(attachmentsWithColor),
        message: params.text,
        identity,
      })
    );
  }
  return responses;
}

const sendSingleSlackMessage = async ({ channel, attachments, message, identity }) => {
  let slackResponse = null;
  try {
    const slackBody = {
      ...slackIdentityToIdentitySettingsMapping[identity],
      channel: (SLACK_REDIRECT_MESSAGES_CHANNEL || channel),
      attachments,
      text: message,
    };

    if (
      slackBody.channel === SLACK_REDIRECT_MESSAGES_CHANNEL &&
      channel !== SLACK_REDIRECT_MESSAGES_CHANNEL &&
      Array.isArray(slackBody.attachments[0]?.fields)
    ) {
      slackBody.attachments[0].fields.push({
        title: 'Original Channel',
        value: `#${channel}`,
      });
    }

    const response = await fetch(SLACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message to Slack: ${response.statusText}`);
    }

    slackResponse = await response.json();
  } catch (error) {
    error.name = 'SlackError';
    error.details = {
      channel,
      attachments,
      message,
    };
    logger.error(error);
  }
  return slackResponse;
};
