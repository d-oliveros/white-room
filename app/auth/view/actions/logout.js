import analytics from '#white-room/client/analytics/analytics.js';
import { ANALYTICS_EVENT_LOGOUT } from '#white-room/client/analytics/eventList.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_LOGOUT,
} from '#white-room/client/helpers/sendDataToMobileApp.js';

export default async function logout({ state, apiClient }) {
  await apiClient.request('/auth/logout', {
    deviceRegistrationId: state.get(['client', 'mobileApp', 'deviceRegistrationId']),
  });

  analytics.track(ANALYTICS_EVENT_LOGOUT);
  analytics.logout();

  sendDataToMobileApp({
    actionType: MOBILE_APP_ACTION_TYPE_LOGOUT,
  });
}
