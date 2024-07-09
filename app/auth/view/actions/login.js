import analytics from '#white-room/client/analytics/analytics.js';
import { ANALYTICS_EVENT_LOGGED_IN } from '#base/constants/eventList.js';

import updateDeviceRegistrationIds from '#user/service/updateDeviceRegistrationIds.js';
import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#white-room/client/helpers/sendDataToMobileApp.js';

import anonymousUser from '#user/constants/anonymousUser.js';

export async function onLogicSuccess({ state, apiClient, user, experimentActiveVariants }) {
  const analyticsSessionId = state.get(['client', 'analytics', 'analyticsSessionId']);
  const mobileAppState = state.get(['client', 'mobileApp']);
  const currentUser = { ...anonymousUser, ...user };

  // Set experiments.
  if (experimentActiveVariants) {
    state.set(['analytics', 'experiments', 'activeVariants'], experimentActiveVariants);
  }

  // Set filters.
  state.set(['search', 'filters'], {
    ...currentUser.searchFilters,
  });

  // Set the new user as the current user in the state.
  state.set('currentUser', currentUser);

  analytics.alias(user.id, analyticsSessionId);
  analytics.identify(user);
  analytics.track(ANALYTICS_EVENT_LOGGED_IN);

  if (mobileAppState.isMobileApp) {
    sendDataToMobileApp({
      actionType: MOBILE_APP_ACTION_TYPE_CURRENT_USER,
      currentUser: currentUser,
    });
  }

  if (
    mobileAppState.isMobileApp &&
    mobileAppState.askedPushNotificationPermission &&
    mobileAppState.deviceRegistrationId
  ) {
    updateDeviceRegistrationIds(
      { state, apiClient },
      { newDeviceRegistrationId: mobileAppState.deviceRegistrationId }
    );
  }
}

export default async function login({ state, apiClient }, { phone, password, autoLoginToken }) {
  const { user, experimentActiveVariants, success } = await apiClient.postWithState({
    action: 'api/auth/login',
    state: state,
    payload: {
      phone,
      password,
      autoLoginToken,
    },
  });

  if (success) {
    await onLogicSuccess({
      state,
      apiClient,
      user,
      experimentActiveVariants,
    });
  }

  return user;
}
