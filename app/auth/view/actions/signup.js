import {
  ANALYTICS_EVENT_SIGNUP,
} from '#white-room/client/analytics/eventList.js';

import logger from '#white-room/logger.js';
import analytics from '#white-room/client/analytics/analytics.js';

import anonymousUser from '#user/constants/anonymousUser.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#white-room/client/helpers/sendDataToMobileApp.js';

export default async function signup({ state, apiClient }, params) {
  const analyticsSessionId = state.get(['client', 'analytics', 'analyticsSessionId']);
  const experimentActiveVariants = state.get(['client', 'analytics', 'experiments', 'activeVariants']);
  const utmSource = state.get(['client', 'analytics', 'utmValues', 'source']);
  const isMobileApp = state.get(['client', 'mobileApp', 'isMobileApp']);

  let newUser;

  await apiClient.postWithState({
    action: '/auth/signup',
    state: state,
    payload: {
      user: {
        firstName: params.firstName,
        lastName: params.lastName,
        password: params.password,
        phone: params.phoneNumber,
        email: params.email,
        signupAnalyticsSessionId: analyticsSessionId,
        signupUtmSource: utmSource,
        experimentActiveVariants: experimentActiveVariants,
      },
    },
    onSuccess({ user }) {
      newUser = {
        ...anonymousUser,
        ...user,
      };
      // Set the new user as the current user in the state.
      state.set('currentUser', newUser);
    },
    onError(error) {
      logger.error(error);
    },
  });

  if (newUser) {
    analytics.alias(newUser.id, analyticsSessionId);
    analytics.identify(newUser);
    analytics.track(ANALYTICS_EVENT_SIGNUP, {
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phoneNumber,
      email: params.email,
      signupAnalyticsSessionId: analyticsSessionId,
      signupUtmSource: utmSource,
    });

    if (isMobileApp) {
      sendDataToMobileApp({
        actionType: MOBILE_APP_ACTION_TYPE_CURRENT_USER,
        currentUser: newUser,
      });
    }
  }

  return newUser;
}
