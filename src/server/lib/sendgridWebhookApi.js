import { Router } from 'express';
import { serializeError } from 'serialize-error';
import lodashPick from 'lodash/fp/pick.js';
import dayjs from 'dayjs';

import logger from '#white-room/logger.js';
import { trackServersideEvent } from '#white-room/server/lib/serversideAnalytics.js';
import {
  SENDGRID_EVENT_OPENED,
  SENDGRID_EVENT_CLICKED,
  SENDGRID_EVENT_TO_ANALYTICS_EVENT_MAPPING,
} from '#white-room/server/lib/sendgridClient.js';

import knex from '#white-room/server/db/knex.js';

const sendgridWebhookApi = new Router();
const debug = logger.createDebug('sendgridWebhookApi');

const whitelistFields = lodashPick([
  'email',
  'event',
  'url',
  'ip',
  'reason',
  'status',
]);

sendgridWebhookApi.post('/event-dispatcher', async (req, res, next) => {
  try {
    const eventsByAppUrl = req.body.reduce((acc, evt) => {
      if (evt.appUrl) {
        acc[evt.appUrl] = acc[evt.appUrl] || [];
        acc[evt.appUrl].push(evt);
      }
      return acc;
    }, {});

    for (const appUrl of Object.keys(eventsByAppUrl)) {
      try {
        await fetch(`${appUrl}/sendgrid/webhooks/event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventsByAppUrl[appUrl]),
        });
      } catch (err) {} // eslint-disable-line no-empty
    }

    res.sendStatus(200);
  } catch (sendgridError) {
    const error = new Error('Error while processing Sendgrid event via /event-dispatcher webhook.', {
      cause: sendgridError,
    });
    error.details = {
      requestBody: req.body,
    };
    error.name = 'SendgridWebhookEventDispatcherError';
    logger.error(error);
    next(error);
  }
});

sendgridWebhookApi.post('/event', async (req, res, next) => {
  debug('request', req.url, req.body);

  try {
    for (const eventRawData of req.body) {
      const sgMessageId = eventRawData.sg_message_id.split('.')[0];

      const transactionalEmail = await knex('transactionalEmails')
        .first('id')
        .where({ email: eventRawData.email, sgMessageId });

      if (transactionalEmail) {
        const eventData = {
          ...whitelistFields(eventRawData),
          sgMessageId,
          sgEventId: eventRawData.sg_event_id,
          createdDate: dayjs.unix(eventRawData.timestamp).toISOString(),
          userAgent: eventRawData.useragent,
          transactionalEmailId: transactionalEmail.id,
        };

        if (Array.isArray(eventRawData.category)) {
          eventData.categories = eventRawData.category;
        }
        else if (eventRawData.category && typeof eventRawData.category === 'string') {
          eventData.categories = [ eventRawData.category ];
        }

        await knex('sendgridEvents').insert(eventData);

        if (eventData.event === SENDGRID_EVENT_OPENED) {
          await knex('transactionalEmails')
            .update({ opened: true })
            .where({ id: transactionalEmail.id });
        }

        const analyticsEvent = SENDGRID_EVENT_TO_ANALYTICS_EVENT_MAPPING[eventData.event];
        if (analyticsEvent) {
          const user = await knex('users')
            .first('*')
            .where('email', eventData.email);

          const segmentEventData = {
            ...whitelistFields(eventRawData),
            sendgridMessageId: sgMessageId,
            sendgridEventId: eventRawData.sg_event_id,
            transactionalEmailId: transactionalEmail.id,
            emailProvider: 'SendGrid',
            emailTimestamp: eventRawData.timestamp,
          };

          if (eventData.event === SENDGRID_EVENT_CLICKED) {
            segmentEventData.emailUrl = eventRawData.url;
          }
          await trackServersideEvent({
            user: user,
            eventName: analyticsEvent,
            eventPayload: segmentEventData,
          });
        }
      }
    }

    res.sendStatus(200);
  }
  catch (sendgridError) {
    const error = new Error('Error while processing Sendgrid event via /event webhook.', {
      cause: sendgridError,
    });
    error.details = {
      requestBody: req.body,
    };
    error.name = 'SendgridWebhookEventError';
    logger.error(error);
    next(error);
  }
});

export default sendgridWebhookApi;
