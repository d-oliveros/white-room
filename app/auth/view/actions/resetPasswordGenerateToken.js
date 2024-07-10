/**
 * This action calls the api to request a JWT Token for reseting a user
 * password. This function is called once a user has verified their phone number.
 *
 * @access public
 *
 * @param {Object}  state The instance of the global state.
 * @param {Object}  apiClient The instance of the api client.
 * @param {string}  params.phone Any params used by this function.
 *
 * @return {string} JWT token with the user's id wrapped. Token is valid for 14 days.
 */
export default async function resetPasswordGenerateToken({ state, apiClient }, params) {
  const { phone } = params;
  let token;
  await apiClient.postWithState({
    action: '/auth/resetPasswordGenerateToken',
    state: state,
    payload: {
      phone,
    },
    onSuccess(generatedToken) {
      token = generatedToken;
      state.set(['resetPasswordForm', 'token'], generatedToken);
    },
  });

  return token;
}
