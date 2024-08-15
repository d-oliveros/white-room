import analytics from '#whiteroom/client/analytics/analytics.js';
import { ANALYTICS_EVENT_LOGOUT } from '#auth/lib/analyticsEventList.js';
import initialState from '#user/view/initialState.js';

export default async function logout({ state, apiClient }) {
  await apiClient.post('/auth/logout');

  analytics.track(ANALYTICS_EVENT_LOGOUT);
  analytics.logout();

  state.set(['currentUser'], { ...initialState.currentUser })
}
