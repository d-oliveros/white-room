import analytics from '#client/analytics.js';
import { ANALYTICS_EVENT_LOGGED_IN } from '#client/analytics/eventList';
import { anonymousUser } from '#client/constants';
import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_CURRENT_USER,
} from '#client/helpers/sendDataToMobileApp.js';
import safeLocalStorage from '#client/lib/safeLocalStorage.js';
import updateDeviceRegistrationIds from '#client/actions/MobileApp/updateDeviceRegistrationIds.js';

import {
  API_ACTION_LOGIN,
} from '#api/actionTypes';

export async function onLogicSuccess({ state, apiClient, user, experimentActiveVariants }) {
  const analyticsSessionId = state.get(['analytics', 'analyticsSessionId']);
  const mobileAppState = state.get(['mobileApp']);
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
  return apiClient.postWithState({
    action: API_ACTION_LOGIN,
    state: state,
    payload: {
      phone,
      password,
      autoLoginToken,
    },
    onSuccess({ user, experimentActiveVariants }) {
      safeLocalStorage.removeItem('viewedListingIds');
      return onLogicSuccess({
        state,
        apiClient,
        user,
        experimentActiveVariants,
      });
    },
  });
}
