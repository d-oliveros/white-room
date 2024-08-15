import analytics from '#white-room/client/analytics/analytics.js';
import { ANALYTICS_EVENT_LOGOUT } from '#white-room/client/analytics/eventList.js';
import initialState from '#user/view/initialState.js';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_LOGOUT,
} from '#white-room/client/helpers/sendDataToMobileApp.js';

export default async function logout({ state, apiClient }) {
  await apiClient.post('/auth/logout');

  analytics.track(ANALYTICS_EVENT_LOGOUT);
  analytics.logout();

  state.set(['currentUser'], { ...initialState.currentUser })

  sendDataToMobileApp({
    actionType: MOBILE_APP_ACTION_TYPE_LOGOUT,
  });
}
