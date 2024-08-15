import {
  ANALYTICS_EVENT_SIGNUP,
} from '#white-room/client/analytics/eventList.js';

import analytics from '#white-room/client/analytics/analytics.js';

import { loadUserInState } from '#auth/view/actions/login.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#white-room/client/helpers/sendDataToMobileApp.js';

const signup = async ({ state, apiClient }, {
  firstName,
  lastName,
  email,
  phone,
  password,
}) => {
  const analyticsSessionId = state.get(['client', 'analytics', 'analyticsSessionId']);
  const experimentActiveVariants = state.get(['client', 'analytics', 'experiments', 'activeVariants']);
  const utmSource = state.get(['client', 'analytics', 'utmValues', 'source']);
  const isMobileApp = state.get(['client', 'mobileApp', 'isMobileApp']);

  const newUserData = {
    firstName,
    lastName,
    password,
    phone,
    email,
    analyticsSessionId,
    experimentActiveVariants: experimentActiveVariants,
  };

  const { user, error } = await apiClient.post('/auth/signup', newUserData);

  if (error) {
    throw new Error(error);
  }

  // Set the new user as the current user in the state.
  await loadUserInState({
    state,
    apiClient,
    user,
    experimentActiveVariants,
  });

  analytics.track(ANALYTICS_EVENT_SIGNUP, {
    firstName,
    lastName,
    phone,
    email,
    signupAnalyticsSessionId: analyticsSessionId,
    signupUtmSource: utmSource,
  });

  if (isMobileApp) {
    sendDataToMobileApp({
      actionType: MOBILE_APP_ACTION_TYPE_CURRENT_USER,
      currentUser: user,
    });
  }

  return user;
}

export default signup;
