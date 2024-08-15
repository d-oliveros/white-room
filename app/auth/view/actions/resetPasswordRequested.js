import analytics from '#whiteroom/client/analytics/analytics.js';

import login from '#auth/view/actions/login.js';

/**
 * This action calls the api to set the new user password
 * & to log the user in once the password has been reset. It will return the login methods
 * promise result.
 *
 * @access  public
 *
 * @param {Object}  state The global state instance.
 * @param {Object}  apiClient The instance of the api client.
 * @param {string}  params.token The token used to validate the password change.
 * @param {string}  params.password The new password the user wants to designate.
 *
 * @return {undefined}
 */
export default async function resetPasswordRequested({ state, apiClient }, params) {
  const {
    token,
    password,
  } = params;

  const user = await apiClient.post('/auth/reset-password', { token, password });
  const analyticsSessionId = state.get(['client', 'analytics', 'analyticsSessionId']);

  analytics.alias(user.id, analyticsSessionId);

  return login({ state, apiClient }, {
    phone: user.phone,
    password: password,
  });
}
