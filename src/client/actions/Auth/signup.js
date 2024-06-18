import {
  API_ACTION_SIGNUP,
} from '#api/actionTypes.js';

import {
  ANALYTICS_EVENT_SIGNUP,
} from '#client/analytics/eventList.js';

import log from '#client/lib/log.js';
import analytics from '#client/analytics/analytics.js';
import anonymousUser from '#client/constants/anonymousUser.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#client/helpers/sendDataToMobileApp.js';

export default async function signup({ state, apiClient }, params) {
  const analyticsSessionId = state.get(['analytics', 'analyticsSessionId']);
  const experimentActiveVariants = state.get(['analytics', 'experiments', 'activeVariants']);
  const utmSource = state.get(['analytics', 'utmValues', 'source']);
  const isMobileApp = state.get(['mobileApp', 'isMobileApp']);

  let newUser;

  await apiClient.postWithState({
    action: API_ACTION_SIGNUP,
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
      log.error(error);
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
