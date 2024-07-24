import { ROLE_ANONYMOUS } from '#user/constants/roles.js';

export default async function updateDeviceRegistrationIds(
  { state, apiClient },
  { newDeviceRegistrationId, oldDeviceRegistrationId }
) {
  const userRoles = state.get(['currentUser', 'roles']);
  const isAnonymous = userRoles.includes(ROLE_ANONYMOUS);

  if (!isAnonymous) {
    await apiClient.postWithState({
      action: 'API_ACTION_USER_UPDATE_DEVICE_REGISTRATION_IDS',
      state: state,
      payload: {
        newDeviceRegistrationId,
        oldDeviceRegistrationId,
      },
      onSuccess() {
        state.set(['client', 'mobileApp', 'deviceRegistrationId'], newDeviceRegistrationId);
        state.set(['client', 'mobileApp', 'askedPushNotificationPermission'], true);
      },
    });
  }
}
