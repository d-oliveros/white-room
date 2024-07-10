import assert from 'assert';
import { Analytics } from '@segment/analytics-node';
import { v4 as uuidv4 } from 'uuid';

import logger from '#white-room/logger.js';
import typeCheck from '#white-room/util/typeCheck.js';
import {
  USER_ROLE_ANONYMOUS,
  hasRoleAnonymous,
} from '#user/constants/userRoles.js';

import {
  transformUserDataToSegmentIdentifyTraits,
} from '#white-room/client/analytics/analytics.js';

const {
  SEGMENT_KEY,
} = process.env;

const debug = logger.createDebug('analytics:serversideAnalytics');

const anonymousUser = {
  roles: [
    USER_ROLE_ANONYMOUS,
  ],
};

export const serversideAnalytics = SEGMENT_KEY
  ? new Analytics({ writeKey: SEGMENT_KEY })
  : null;

/**
 * Extracts serverside-specific contextual data for analytics.
 *
 * @param {Object} options.user User object to track this event as.
 * return {Object}
 */
export default function makeServersideContext({ user = anonymousUser }) {
  const serversideContext = {};

  serversideContext.eventId = uuidv4();

  // TODO: Move to userland
  serversideContext.userRoles = user.roles;
  serversideContext.isAnonymous = hasRoleAnonymous(user.roles);
  // serversideContext.isAdmin = hasRoleAdmin(user.roles);

  // if (!serversideContext.isAnonymous) {
  //   serversideContext.userId = user.id;
  //   serversideContext.userFirstName = user.firstName;
  //   serversideContext.userLastName = user.lastName;
  //   serversideContext.userProfileImage = user.profileImage;
  //   serversideContext.userPhone = user.phone;
  //   serversideContext.userEmail = user.email;
  //   serversideContext.userSignupProvider = user.signupProvider;
  // }

  // Sanitize the application context object by removing empty values, except booleans and numbers.
  Object.keys(serversideContext).forEach((serversideContextFieldName) => {
    const serversideContextFieldValue = serversideContext[serversideContextFieldName];
    if (
      typeof serversideContextFieldValue !== 'boolean'
      && (typeof serversideContextFieldValue !== 'number' || isNaN(serversideContextFieldValue))
      && !serversideContextFieldValue
    ) {
      delete serversideContext[serversideContextFieldName];
    }
  });

  return serversideContext;
}

export function identifyServersideUser({ user, traits = {} }) {
  typeCheck('user::NonEmptyObject', user);

  const identifyUser = {
    userId: String(user.id),
    traits: {
      ...transformUserDataToSegmentIdentifyTraits(user),
      ...traits,
    },
  };

  if (serversideAnalytics) {
    debug('Identifying serverside user', identifyUser);
    serversideAnalytics.identify(identifyUser);
  }
  else {
    debug('Segment not enabled, aborting', identifyUser);
  }
}

/**
 * Tracks an event on server-side.
 */
export function trackServersideEvent({
  user,
  anonymousUserId,
  eventName,
  eventPayload,
  context,
}) {
  assert(!process.browser, 'The serverside analytics library is meant to be run on serverside only.');
  typeCheck('user::Maybe NonEmptyObject', user);
  typeCheck('eventName::NonEmptyString', eventName);
  typeCheck('eventPayload::Maybe Object', eventPayload);

  const serversideContext = makeServersideContext({ user });
  const serversideEvent = {
    event: eventName,
    userId: user ? String(user.id) : null,
    email: user ? user.email : null,
    createdAt: user ? (user.createdDate || user.createdAt) : null,
    properties: {
      ...(eventPayload || {}),
      ...serversideContext,
    },
    context,
  };

  serversideEvent.integrations = {
    All: true,
  };

  if (!serversideEvent.userId) {
    serversideEvent.anonymousId = anonymousUserId
      ? `${anonymousUserId}`
      : uuidv4();
  }

  if (serversideAnalytics) {
    debug('Tracking serverside event', serversideEvent);
    serversideAnalytics.track(serversideEvent);
  }
  else {
    debug('Segment not enabled, aborting', serversideEvent);
  }
}
