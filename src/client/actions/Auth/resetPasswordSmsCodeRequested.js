import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
} from 'api/actionTypes';

/**
 * This action generates a new SMS with a 4 digit code and is texted to the user.
 * It also sets global state (object) resetPasswordForm.phone
 *
 * @access public
 *
 * @param {Object}   apiClient The instance of the api client.
 * @param {string}   params.phone The phone number used to make the call
 *
 * @returns {undefined}
 */
export default async function resetPasswordSmsCodeRequested({ state, apiClient }, params) {
  const { phone } = params;
  await apiClient.postWithState({
    action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
    state: state,
    payload: {
      phone,
    },
    onSuccess() {
      state.set(['resetPasswordForm', 'phone'], phone);
    },
  });
}
