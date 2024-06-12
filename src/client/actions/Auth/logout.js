import analytics from '#client/analytics/analytics.js';
import { ANALYTICS_EVENT_LOGOUT } from '#client/analytics/eventList.js';
import makeInitialState from '#client/makeInitialState.js';
import { API_ACTION_LOGOUT } from '#api/actionTypes.js';
import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_LOGOUT,
} from '#client/helpers/sendDataToMobileApp.js';

export default async function logout({ state, apiClient }) {
  return apiClient.postWithState({
    action: API_ACTION_LOGOUT,
    state: state,
    payload: {
      deviceRegistrationId: state.get(['mobileApp', 'deviceRegistrationId']),
    },
    async onSuccess() {
      analytics.track(ANALYTICS_EVENT_LOGOUT);

      const initialState = makeInitialState();
      for (const key of Object.keys(initialState)) {
        state.set(key, initialState[key]);
      }

      analytics.logout();

      sendDataToMobileApp({
        actionType: MOBILE_APP_ACTION_TYPE_LOGOUT,
      });
    },
  });
}
