import { resolve as resolveUrl } from 'url';

import logger from '#white-room/logger.js';
import typeCheck from '#white-room/util/typeCheck.js';

import {
  SENDGRID_ERROR_RESPONSE_NOT_OK,
} from '#white-room/constants/errorCodes.js';

import {
  ANALYTICS_EVENT_EMAIL_DELIVERED,
  ANALYTICS_EVENT_EMAIL_OPENED,
  ANALYTICS_EVENT_EMAIL_CLICKED,
  ANALYTICS_EVENT_EMAIL_BOUNCED,
  ANALYTICS_EVENT_EMAIL_DROPPED,
  ANALYTICS_EVENT_EMAIL_SPAM_REPORT,
  ANALYTICS_EVENT_EMAIL_UNSUBSCRIBE,
  ANALYTICS_EVENT_EMAIL_GROUP_UNSUBSCRIBE,
  ANALYTICS_EVENT_EMAIL_GROUP_RESUBSCRIBE,
} from '#white-room/client/analytics/eventList.js';

import {
  postSlackMessage,
} from '#white-room/server/lib/slackClient.js';

const {
  APP_URL,
  APP_TITLE,
  APP_EMAIL,
  SENDGRID_API_KEY,
  SENDGRID_REDIRECT_EMAILS_TO,
  SLACK_NOTIFY_EMAIL_CHANNEL,
  SLACK_REDIRECT_MESSAGES_CHANNEL,
} = process.env;

const debug = logger.createDebug('sendgrid');

export const sendgridIsEnabled = !!SENDGRID_API_KEY;

export const SENDGRID_TEMPLATE_TESTING = 'tbd';

export const SENDGRID_CATEGORY_TEST = 'Testing';

export const SENDGRID_EVENT_DELIVERED = 'delivered';
export const SENDGRID_EVENT_OPENED = 'open';
export const SENDGRID_EVENT_CLICKED = 'click';
export const SENDGRID_EVENT_BOUNCED = 'bounce';
export const SENDGRID_EVENT_DROPPED = 'dropped';
export const SENDGRID_EVENT_SPAM_REPORT = 'spamreport';
export const SENDGRID_EVENT_UNSUBSCRIBE = 'unsubscribe';
export const SENDGRID_EVENT_GROUP_UNSUBSCRIBE = 'group_unsubscribe';
export const SENDGRID_EVENT_GROUP_RESUBSCRIBE = 'group_resubscribe';

export const SENDGRID_EVENT_TO_ANALYTICS_EVENT_MAPPING = {
  [SENDGRID_EVENT_DELIVERED]: ANALYTICS_EVENT_EMAIL_DELIVERED,
  [SENDGRID_EVENT_OPENED]: ANALYTICS_EVENT_EMAIL_OPENED,
  [SENDGRID_EVENT_CLICKED]: ANALYTICS_EVENT_EMAIL_CLICKED,
  [SENDGRID_EVENT_BOUNCED]: ANALYTICS_EVENT_EMAIL_BOUNCED,
  [SENDGRID_EVENT_DROPPED]: ANALYTICS_EVENT_EMAIL_DROPPED,
  [SENDGRID_EVENT_SPAM_REPORT]: ANALYTICS_EVENT_EMAIL_SPAM_REPORT,
  [SENDGRID_EVENT_UNSUBSCRIBE]: ANALYTICS_EVENT_EMAIL_UNSUBSCRIBE,
  [SENDGRID_EVENT_GROUP_UNSUBSCRIBE]: ANALYTICS_EVENT_EMAIL_GROUP_UNSUBSCRIBE,
  [SENDGRID_EVENT_GROUP_RESUBSCRIBE]: ANALYTICS_EVENT_EMAIL_GROUP_RESUBSCRIBE,
};

/**
 * Requests a SendGrid endpoint.
 *
 * @param  {string} options.method         HTTP method to use.
 * @param  {string} options.path           Path to request.
 * @param  {Object} options.body           Request body.
 * @param  {Object} options.fullResponse   If true returns the full SendGrid response.
 * @return {Object}                        SendGrid response.
 */
async function requestSendgridEndpoint({ method, path, body, fullResponse }) {
  typeCheck('path::NonEmptyString', path);
  typeCheck('method::NonEmptyString', method);

  path = path.indexOf('/') === 0 ? path.substr(1) : path;
  method = method.toUpperCase();

  const url = resolveUrl('https://api.sendgrid.com/v3/', path);

  debug(`Sending ${method} request to: ${url}${body ? ' with ' + JSON.stringify(body, null, 2) : ''}`);

  if (!sendgridIsEnabled) {
    debug('[requestSendgridEndpoint] SendGrid is not enabled. Aborting.');
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let result;

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.json();
      const error = new Error(`SendGrid response not OK: ${response.statusText}`);
      error.name = SENDGRID_ERROR_RESPONSE_NOT_OK;
      error.details = {
        responseStatus: response.status,
        responseBody: errorBody,
        responseHeaders: [...response.headers.entries()]
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      };
      throw error;
    }

    if (fullResponse) {
      result = response;
    } else {
      result = await response.json();
    }
  } catch (fetchError) {
    const error = new Error(`SendGrid request failed: ${fetchError.message}`);
    error.name = SENDGRID_ERROR_RESPONSE_NOT_OK;
    error.details = {
      message: fetchError.message,
      stack: fetchError.stack
    };
    throw error;
  }

  return result;
}

export function overrideRedictTestingEmailTo(email) {
  if (!SENDGRID_REDIRECT_EMAILS_TO || !email) {
    return email || null;
  }
  const [to, domain] = email.split('@')
    .map((part) => part.replace(/\./g, '_'));

  return SENDGRID_REDIRECT_EMAILS_TO.replace('@', `+${to}_${domain}@`);
}

/**
 * Sends an email through SendGrid using an email template.
 *
 * @param  {Object} params
 * @param  {string} params.templateId          SendGrid template ID to use.
 * @param  {string} params.attachments         SendGrid attachments array.
 * @param  {Object} params.values              Values to use in the SendGrid template.
 * @param  {Array}  params.recipients          List of recipients to send the email to.
 * @param  {string} params.recipients[].name   Name of this recipient.
 * @param  {string} params.recipients[].email  Email of this recipient.
 * @param  {string} params.cc[].name           Name of this CC.
 * @param  {string} params.cc[].email          Email of this CC.
 *
 * @return {undefined}
 */
export async function sendMail(params) {
  try {
    typeCheck('params::NonEmptyObject', params);

    const {
      templateId,
      attachments,
      values,
      fromEmail,
      fromName,
      categories,
      replyTo,
      asm,
    } = params;
    let { recipients, cc } = params;

    typeCheck('templateId::NonEmptyString', templateId);
    typeCheck('attachments::Maybe Array', attachments);
    typeCheck('values::Maybe Object', values);
    typeCheck('recipients::NonEmptyArray', recipients);
    typeCheck('cc::Maybe NonEmptyArray', cc);
    typeCheck('fromEmail::Maybe String', fromEmail);
    typeCheck('replyTo::Maybe Object', replyTo);
    typeCheck('asm::Maybe Object', asm);

    for (const { name, email } of recipients) {
      typeCheck('name::Maybe String', name);
      typeCheck('email::Email', email);
    }

    for (const { name, email } of (cc || [])) {
      typeCheck('ccName::Maybe String', name);
      typeCheck('ccEmail::Email', email);
    }

    if (categories) {
      typeCheck('category::Array', categories);
      for (const category of categories) {
        typeCheck('singleCategory::String', category);
      }
    }

    if (replyTo) {
      typeCheck('replyToEmail::Email', replyTo.email);
      typeCheck('replyToName::String', replyTo.name);
    }

    // Override email recipients if this env var is set. Useful in testing/development environments.
    if (SENDGRID_REDIRECT_EMAILS_TO) {
      typeCheck('SENDGRID_REDIRECT_EMAILS_TO::Email', SENDGRID_REDIRECT_EMAILS_TO);

      recipients = recipients
        .map((recipient) => ({ ...recipient, email: overrideRedictTestingEmailTo(recipient.email) }));

      if (cc) {
        cc = cc
          .map((recipient) => ({ ...recipient, email: overrideRedictTestingEmailTo(recipient.email) }));
      }
    }

    await requestSendgridEndpoint({
      method: 'post',
      path: '/mail/send',
      body: {
        template_id: templateId,
        attachments: attachments,
        from: {
          email: fromEmail || APP_EMAIL,
          name: fromName || APP_TITLE,
        },
        personalizations: [
          {
            dynamic_template_data: values,
            to: recipients,
            cc: cc,
          },
        ],
        categories: categories || [],
        reply_to: replyTo,
        asm: asm,
        custom_args: {
          appUrl: APP_URL,
        },
      },
      fullResponse: true,
    });

    if (SLACK_REDIRECT_MESSAGES_CHANNEL || SLACK_NOTIFY_EMAIL_CHANNEL) {
      await postSlackMessage({
        channel: SLACK_REDIRECT_MESSAGES_CHANNEL || SLACK_NOTIFY_EMAIL_CHANNEL,
        attachments: [
          {
            fallback: 'Sending Email',
            title: 'Sending Email',
            fields: [
              {
                title: 'Email',
                value: categories.join(' '),
                short: true,
              },
              {
                title: 'Template',
                value: templateId,
                short: true,
              },
              {
                title: 'Recipients',
                value: recipients.map(({ email, name }) => `${email} - ${name}`).join(', '),
              },
              {
                title: 'Values',
                value: JSON.stringify(values, null, 2),
              },
            ],
          },
        ],
      });
    }
  }
  catch (superAgentError) {
    logger.error(superAgentError);
  }
}
