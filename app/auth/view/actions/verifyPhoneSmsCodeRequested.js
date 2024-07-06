export default async function verifyPhoneSmsCodeRequested({ apiClient }, { phone }) {
  await apiClient.post('/auth/verifyPhoneSmsCodeRequested', {
    phone,
  });
}
