import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
} from 'api/actionTypes';

export default async function verifyPhoneSmsCodeRequested({ apiClient }, params) {
  const { phone } = params;
  await apiClient.post(API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED, { phone });
}
