import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT,
} from '#api/actionTypes';

export default async function verifyPhoneSmsCodeSubmit({ state, apiClient }, params) {
  const { phone, code } = params;
  const isVerified = await apiClient.post(API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT, { phone, code });
  if (isVerified) {
    state.set(['currentUser', 'phoneVerified'], true);
    state.set(['currentUser', 'phoneConfirmed'], true);
  }
  return isVerified;
}
