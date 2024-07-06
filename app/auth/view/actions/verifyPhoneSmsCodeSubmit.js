export default async function verifyPhoneSmsCodeSubmit({ state, apiClient }, params) {
  const { phone, code } = params;
  const isVerified = await apiClient.post('/auth/verifyPhoneSmsCodeSubmit', { phone, code });
  if (isVerified) {
    state.set(['currentUser', 'phoneVerified'], true);
    state.set(['currentUser', 'phoneConfirmed'], true);
  }
  return isVerified;
}
